// d02_module_patterns / ex8 - reference solution (author only, used by `dojo verify`).

export interface Orderable {
  name: string;
  after?: string[];
}

export function orderPlugins(plugins: Orderable[]): string[] {
  const pending = new Map<string, Set<string>>();
  const known = new Set(plugins.map((plugin) => plugin.name));

  for (const plugin of plugins) {
    for (const dependency of plugin.after ?? []) {
      if (!known.has(dependency)) {
        throw new Error(`unknown dependency: ${plugin.name} needs ${dependency}`);
      }
    }
    pending.set(plugin.name, new Set(plugin.after ?? []));
  }

  const ordered: string[] = [];
  while (pending.size > 0) {
    // Sorting the ready set is what makes the result a property of the graph
    // rather than of the input array.
    const ready = [...pending.entries()]
      .filter(([, blockers]) => blockers.size === 0)
      .map(([name]) => name)
      .sort();

    if (ready.length === 0) {
      const stuck = [...pending.keys()].sort().join(", ");
      throw new Error(`circular dependency among: ${stuck}`);
    }

    const next = ready[0];
    ordered.push(next);
    pending.delete(next);
    for (const blockers of pending.values()) blockers.delete(next);
  }

  return ordered;
}
