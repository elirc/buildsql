// d02_module_patterns / ex6 - reference solution (author only, used by `dojo verify`).

export interface PluginApi {
  addCommand(name: string, run: () => string): void;
}

export interface Plugin {
  name: string;
  setup(api: PluginApi): (() => void) | void;
}

export interface PluginHost {
  use(plugin: Plugin): PluginHost;
  start(): void;
  run(command: string): string;
  stop(): void;
  started(): boolean;
}

export function createPluginHost(): PluginHost {
  const plugins: Plugin[] = [];
  const commands = new Map<string, () => string>();
  const teardowns: (() => void)[] = [];
  let running = false;

  const host: PluginHost = {
    use(plugin: Plugin): PluginHost {
      if (running) throw new Error("cannot add plugins after start");
      plugins.push(plugin);
      return host;
    },

    start(): void {
      if (running) throw new Error("already started");
      running = true;
      const api: PluginApi = {
        addCommand(name: string, run: () => string): void {
          commands.set(name, run);
        },
      };
      for (const plugin of plugins) {
        const teardown = plugin.setup(api);
        if (typeof teardown === "function") teardowns.push(teardown);
      }
    },

    run(command: string): string {
      if (!running) throw new Error("not started");
      const handler = commands.get(command);
      if (!handler) throw new Error(`unknown command: ${command}`);
      return handler();
    },

    stop(): void {
      if (!running) throw new Error("not started");
      // Reverse: a later plugin may have been built on an earlier one, so the
      // earlier one has to still be alive while the later one shuts down.
      for (let i = teardowns.length - 1; i >= 0; i -= 1) teardowns[i]();
      teardowns.length = 0;
      commands.clear();
      running = false;
    },

    started(): boolean {
      return running;
    },
  };

  return host;
}
