// 02_functions / ex3 - reference solution (author only).

export function forEachTrack(
  names: readonly string[],
  visit: (name: string, index: number) => void,
): void {
  for (let i = 0; i < names.length; i++) {
    visit(names[i], i);
  }
}
