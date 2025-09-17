import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";

const packagesDirs = ["packages", "apps"];
const packageJSONSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});

async function main() {
  const packageVersions = new Map<string, Set<string>>();
  for (const dir of packagesDirs) {
    const dirPath = path.resolve(__dirname, "..", dir);
    const childrenPackages = await fs.readdir(dirPath);
    for (const child of childrenPackages) {
      const childPath = path.resolve(dirPath, child);
      const stat = await fs.stat(childPath);
      if (stat.isDirectory()) {
        const packageJSONPath = path.resolve(childPath, "package.json");
        const packageJSONContent = packageJSONSchema.parse(
          JSON.parse(await fs.readFile(packageJSONPath, "utf-8"))
        );
        const allDependencies = {
          ...(packageJSONContent.dependencies ?? {}),
          ...(packageJSONContent.devDependencies ?? {}),
        };
        for (const [packageName, version] of Object.entries(allDependencies)) {
          if (packageVersions.has(packageName)) {
            packageVersions.get(packageName)?.add(version);
          } else {
            packageVersions.set(packageName, new Set([version]));
          }
        }
      }
    }
  }
  for (const [packageName, versions] of packageVersions.entries()) {
    if (versions.size !== 1) {
      console.log(`${packageName} version mismatch`);
    }
  }
}

main();
