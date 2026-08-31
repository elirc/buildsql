// d02_module_patterns / ex7 - reference solution (author only, used by `dojo verify`).

export interface Container {
  register(name: string, factory: (container: Container) => unknown): void;
  resolve<T>(name: string): T;
}

export function createContainer(): Container {
  const factories = new Map<string, (container: Container) => unknown>();
  const instances = new Map<string, unknown>();
  //: the names currently being built, outermost first
  const building: string[] = [];

  const container: Container = {
    register(name, factory): void {
      factories.set(name, factory);
    },

    resolve<T>(name: string): T {
      if (instances.has(name)) return instances.get(name) as T;

      const factory = factories.get(name);
      if (!factory) throw new Error(`nothing registered under: ${name}`);

      if (building.includes(name)) {
        const path = [...building.slice(building.indexOf(name)), name];
        throw new Error(`circular dependency: ${path.join(" -> ")}`);
      }

      building.push(name);
      try {
        const value = factory(container);
        instances.set(name, value);
        return value as T;
      } finally {
        // The finally is the point: without it a detected cycle leaves the
        // stack dirty and every later resolve reports a phantom loop.
        building.pop();
      }
    },
  };

  return container;
}
