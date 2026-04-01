import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import colors from 'picocolors'
import * as z from 'zod'

const packagesDirs = ['.', 'packages', 'apps']
const packageJSONSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
})
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const packageVersions = new Map<string, Set<string>>()

  const errors: string[] = []

  async function parsePackageJSON(child: string, relPath: string) {
    const packageJSONPath = path.resolve(relPath, 'package.json')
    if (
      await fs
        .stat(packageJSONPath)
        .then(() => true)
        .catch(() => false)
    ) {
      const packageJSONContent = packageJSONSchema.parse(
        JSON.parse(await fs.readFile(packageJSONPath, 'utf-8')),
      )
      const allDependencies = {
        ...(packageJSONContent.dependencies ?? {}),
        ...(packageJSONContent.devDependencies ?? {}),
      }
      for (const [packageName, version] of Object.entries(allDependencies)) {
        if (version.startsWith('^')) {
          errors.push(
            `${child} - ${packageName} - ${version} is not pinned to exact version`,
          )
        }

        if (packageVersions.has(packageName)) {
          packageVersions.get(packageName)?.add(version)
        } else {
          packageVersions.set(packageName, new Set([version]))
        }
      }
    }
  }

  for (const dir of packagesDirs) {
    const dirPath = path.resolve(__dirname, '..', dir)

    const dirExists = await fs
      .stat(dirPath)
      .then((stat) => stat.isDirectory())
      .catch(() => false)
    if (!dirExists) {
      // eslint-disable-next-line no-console
      console.log(
        colors.yellow(`directory ${dirPath} does not exist, skipping...`),
      )
      continue
    }

    const childrenPackages = await fs.readdir(dirPath)
    for (const child of childrenPackages) {
      const childPath = path.resolve(dirPath, child)
      const stat = await fs.stat(childPath)
      if (stat.isDirectory()) {
        await parsePackageJSON(child, childPath)
      } else if (stat.isFile() && child === 'package.json') {
        await parsePackageJSON('.', dirPath)
      }
    }
  }
  for (const [packageName, versions] of packageVersions.entries()) {
    if (versions.size !== 1) {
      errors.push(
        `${packageName} version mismatch - ${Array.from(versions).join(', ')}`,
      )
    }
  }

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.log(colors.red('version mismatches found:'))
    for (const error of errors) {
      // eslint-disable-next-line no-console
      console.error(colors.red(`- ${error}`))
    }
    process.exit(1)
  } else {
    // eslint-disable-next-line no-console
    console.log(colors.green('all package versions are consistent and pinned.'))
  }
}

main()
