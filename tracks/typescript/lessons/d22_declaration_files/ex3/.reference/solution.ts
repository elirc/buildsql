// d22_declaration_files / ex3 - reference solution (author only).

declare global {
  // eslint-disable-next-line no-var
  var __d22BuildRegistry: Record<string, number> | undefined;
}

export function registerBuild(name: string, version: number): void {
  if (globalThis.__d22BuildRegistry === undefined) {
    globalThis.__d22BuildRegistry = {};
  }
  globalThis.__d22BuildRegistry[name] = version;
}

export function readBuild(name: string): number | undefined {
  return globalThis.__d22BuildRegistry?.[name];
}
