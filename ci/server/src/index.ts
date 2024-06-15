import { dag, Container, Directory, object, func } from '@dagger.io/dagger'

@object()
class Server {
  /**
   * Build the server image.
   *
   * @param source The source directory
   */
  @func()
  build(source: Directory) {
    const base = dag
      .container()
      .from('node:20.14.0-alpine3.20')
      .withExec(['corepack', 'enable'])
      .withExec(['corepack', 'install', '-g', 'pnpm@9.2.0'])
      .withWorkdir('/app')

    const pruned = base
      .withExec(['apk', 'add', '--no-cache', 'libc6-compat'])
      .withDirectory('/app', source, {
        exclude: ['**/node_modules', '**/.git', '**/.env'],
      })
      .withExec(['pnpx', 'turbo', 'prune', '--scope', '@repo/server', '--docker'])

    const built = base
      .withDirectory('/app', pruned.directory('/app/out/json'))
      .withExec(['pnpm', 'install', '--frozen-lockfile'])
      .withDirectory('/app', pruned.directory('/app/out/full'))
      .withFile('/app/turbo.json', pruned.file('/app/turbo.json'))
      .withExec(['pnpm', 'run', '--filter', '@repo/server', '-r', 'db:generate'])
      .withExec(['pnpm', 'run', 'build', '--filter', '@repo/server'])

    const deploy = base
      .withUser('node')
      .withDirectory('/app', built.directory('/app'), { owner: 'node' })
      .withExposedPort(3000)
      .withWorkdir('/app/apps/server')
      .withEntrypoint(['node', './dist/main.js'])

    return deploy
  }
}
