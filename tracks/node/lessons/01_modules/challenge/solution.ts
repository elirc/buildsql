// 01_modules / challenge - a module cache of your own.
// See lessons/01_modules/README.md, "Challenge".

export interface ModuleCache<T> {
  get(key: string): Promise<T>;
  size(): number;
}

export function createModuleCache<T>(load: (key: string) => Promise<T>): ModuleCache<T> {
  throw new Error("challenge: createModuleCache() is not implemented yet - edit this file.");
}
