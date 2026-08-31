// An ES module that owns a mutable number and exports it directly.
export let total = 0;

export function add(n: number): void {
  total += n;
}
