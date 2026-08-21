// 00_hello_dojo / ex3 - reference solution (author only, used by `dojo verify`).

export function parseLessonNumber(slug: string): number {
  return Number.parseInt(slug.split("_")[0], 10);
}
