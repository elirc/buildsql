// d02_module_patterns / ex6 - the plugin host, with a lifecycle.
// See lessons/d02_module_patterns/README.md, "Problem 6".

export interface PluginApi {
  addCommand(name: string, run: () => string): void;
}

export interface Plugin {
  name: string;
  /** May return a teardown function, which stop() calls in reverse order. */
  setup(api: PluginApi): (() => void) | void;
}

export interface PluginHost {
  /** Chainable. Throws `cannot add plugins after start` once started. */
  use(plugin: Plugin): PluginHost;
  /** Throws `already started` the second time. */
  start(): void;
  /** Throws `not started`, or `unknown command: <name>`. */
  run(command: string): string;
  /** Throws `not started`. Teardowns run in reverse registration order. */
  stop(): void;
  started(): boolean;
}

export function createPluginHost(): PluginHost {
  throw new Error("ex6: createPluginHost() is not implemented yet - edit this file.");
}
