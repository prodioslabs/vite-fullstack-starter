import { dag, func, object } from '@dagger.io/dagger'

@object()
class Ci {
  /**
   * Returns the echoed value from the provided string.
   *
   * @param value The string to echo
   */
  @func()
  async echo(value: string) {
    return await dag.container().from('alpine:3.20.0').withExec(['echo', value]).stdout()
  }
}
