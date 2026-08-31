// d02_module_patterns / ex5 - reference solution (author only, used by `dojo verify`).

export interface Entry {
  id: string;
  event: string;
  at: number;
}

export interface Store {
  save(entry: Entry): void;
  all(): Entry[];
}

export interface Deps {
  now: () => number;
  ids: () => string;
  store: Store;
}

export interface Service {
  record(event: string): Entry;
  history(): Entry[];
}

function createMemoryStore(): Store {
  const entries: Entry[] = [];
  return {
    save(entry: Entry): void {
      entries.push(entry);
    },
    all(): Entry[] {
      return [...entries];
    },
  };
}

// Built per call. A module-level `const defaultDeps` would mean every service
// in the process shared one store - and one counter.
function createDefaultDeps(): Deps {
  let next = 0;
  return {
    now: () => Date.now(),
    ids: () => `e-${(next += 1)}`,
    store: createMemoryStore(),
  };
}

export function createService(overrides: Partial<Deps> = {}): Service {
  const deps: Deps = { ...createDefaultDeps(), ...overrides };

  return {
    record(event: string): Entry {
      const entry: Entry = { id: deps.ids(), event, at: deps.now() };
      deps.store.save(entry);
      return entry;
    },
    history(): Entry[] {
      return deps.store.all();
    },
  };
}
