#!/usr/bin/env bun
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { cancel, intro, isCancel, log, outro, select } from '@clack/prompts'

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

type DependencyField = (typeof DEPENDENCY_FIELDS)[number]

type PackageJson = {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [key: string]: unknown
}

type DependencyRef = {
  filePath: string
  field: DependencyField
  version: string
}

const ROOT = path.resolve(__dirname, '..')

function isSkippableVersion(version: string): boolean {
  return (
    version.startsWith('workspace:') ||
    version.startsWith('file:') ||
    version.startsWith('link:') ||
    version.startsWith('npm:')
  )
}

function isPinned(version: string): boolean {
  return /^\d/.test(version) && !/^[\^~>=<*]/.test(version)
}

function normalizeVersion(version: string): string {
  if (isSkippableVersion(version)) return version
  if (version === 'latest' || version === '*') return version

  const match = version.match(/(\d+\.\d+\.\d+(?:[-+][\w.-]+)?)/)
  return match?.[1] ?? version
}

async function findPackageJsonFiles(dir: string): Promise<Array<string>> {
  const results: Array<string> = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      results.push(...(await findPackageJsonFiles(fullPath)))
      continue
    }

    if (entry.isFile() && entry.name === 'package.json') {
      results.push(fullPath)
    }
  }

  return results
}

function collectDependencyRefs(
  packageJsonFiles: Array<string>,
  contents: Map<string, PackageJson>,
): Map<string, Array<DependencyRef>> {
  const byPackage = new Map<string, Array<DependencyRef>>()

  for (const filePath of packageJsonFiles) {
    const pkg = contents.get(filePath)
    if (!pkg) continue

    for (const field of DEPENDENCY_FIELDS) {
      const deps = pkg[field]
      if (!deps) continue

      for (const [name, version] of Object.entries(deps)) {
        if (isSkippableVersion(version)) continue

        const refs = byPackage.get(name) ?? []
        refs.push({ filePath, field, version })
        byPackage.set(name, refs)
      }
    }
  }

  return byPackage
}

async function resolveTargetVersion(
  packageName: string,
  refs: Array<DependencyRef>,
): Promise<string | null> {
  const rawVersions = [...new Set(refs.map((ref) => ref.version))]
  const normalizedVersions = [
    ...new Set(rawVersions.map((version) => normalizeVersion(version))),
  ]

  const needsManualInput = normalizedVersions.some(
    (version) => version === 'latest' || version === '*',
  )

  if (needsManualInput) {
    log.warn(
      `Skipping ${packageName}: uses "${rawVersions.join('", "')}" (cannot auto-pin).`,
    )
    return null
  }

  if (normalizedVersions.length === 1) {
    return normalizedVersions[0]!
  }

  const options = normalizedVersions
    .map((version) => {
      const usages = refs.filter(
        (ref) => normalizeVersion(ref.version) === version,
      )
      const locations = [
        ...new Set(
          usages.map((ref) => {
            const relative = path.relative(ROOT, ref.filePath)
            return `${relative} (${ref.field})`
          }),
        ),
      ]

      return {
        value: version,
        label: version,
        hint: locations.join(', '),
        count: usages.length,
      }
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map(({ value, label, hint }) => ({ value, label, hint }))

  const selected = await select({
    message: `Multiple versions found for "${packageName}". Choose the pinned version:`,
    options,
  })

  if (isCancel(selected)) {
    cancel('Version matching cancelled.')
    process.exit(0)
  }

  return selected
}

function applyPinnedVersions(
  pkg: PackageJson,
  pinnedVersions: Map<string, string>,
): boolean {
  let changed = false

  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field]
    if (!deps) continue

    for (const [name, version] of Object.entries(deps)) {
      const target = pinnedVersions.get(name)
      if (!target || version === target) continue

      deps[name] = target
      changed = true
    }
  }

  return changed
}

async function main() {
  intro('Match dependency versions across the monorepo')

  const packageJsonFiles = (await findPackageJsonFiles(ROOT)).sort()
  const contents = new Map<string, PackageJson>()

  for (const filePath of packageJsonFiles) {
    const raw = await fs.readFile(filePath, 'utf8')
    contents.set(filePath, JSON.parse(raw) as PackageJson)
  }

  const dependencyRefs = collectDependencyRefs(packageJsonFiles, contents)
  const pinnedVersions = new Map<string, string>()
  let updatedFiles = 0

  for (const [packageName, refs] of [...dependencyRefs.entries()].sort(
    ([a], [b]) => a.localeCompare(b),
  )) {
    const targetVersion = await resolveTargetVersion(packageName, refs)
    if (!targetVersion) continue

    const alreadyPinned = refs.every(
      (ref) => ref.version === targetVersion && isPinned(ref.version),
    )

    if (alreadyPinned) continue

    pinnedVersions.set(packageName, targetVersion)
  }

  for (const filePath of packageJsonFiles) {
    const pkg = contents.get(filePath)
    if (!pkg) continue

    const changed = applyPinnedVersions(pkg, pinnedVersions)
    if (!changed) continue

    await fs.writeFile(filePath, `${JSON.stringify(pkg, null, 2)}\n`)
    updatedFiles += 1
    log.info(`Updated ${path.relative(ROOT, filePath)}`)
  }

  if (pinnedVersions.size === 0) {
    outro('All dependency versions are already pinned and aligned.')
    return
  }

  outro(
    `Pinned ${pinnedVersions.size} package(s) across ${updatedFiles} file(s). Run "bun install" to refresh the lockfile.`,
  )
}

main().catch((error) => {
  log.error(error)
  process.exit(1)
})
