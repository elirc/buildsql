// Shipped with the lesson - do not edit. The formatter modules call
// markLoaded() from their module body, so `loadedFormatters()` is a record of
// which modules the runtime has actually evaluated. That is how the gate can
// tell a dynamic import from a static one.

export type Row = Record<string, string | number>;
export type Formatter = (rows: Row[]) => string;

const loaded: string[] = [];

export function markLoaded(name: string): void {
  loaded.push(name);
}

export function loadedFormatters(): readonly string[] {
  return loaded;
}
