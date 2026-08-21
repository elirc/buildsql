// 00_hello_dojo / ex2 - reference solution (author only, used by `dojo verify`).

export function describeTrack(name: string, lessons: number): string {
  const noun = lessons === 1 ? "lesson" : "lessons";
  return `${name}: ${lessons} ${noun}`;
}
