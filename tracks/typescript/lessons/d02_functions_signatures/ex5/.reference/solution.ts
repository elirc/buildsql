// d02_functions_signatures / ex5 - reference solution (author only).

export function normaliseTag(tag: string): string;
export function normaliseTag(tags: string[]): string[];
export function normaliseTag(input: string | string[]): string | string[] {
  if (Array.isArray(input)) {
    return input.map((tag) => normaliseTag(tag));
  }
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}
