// 01_modules / review1 - reference solution (author only, used by `dojo verify`).

const seen = new Set<string>();

export function firstTimeSeeing(token: string): boolean {
  if (seen.has(token)) return false;
  seen.add(token);
  return true;
}

export function seenCount(): number {
  return seen.size;
}
