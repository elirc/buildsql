// d12_builtin_utilities / ex5 - reference solution (author only).

export interface Posting {
  id: string;
  title: string;
  salary: number;
  remote: boolean;
}

export function diffPatch(before: Posting, after: Posting): Partial<Posting> {
  const patch: Partial<Posting> = {};
  for (const key of Object.keys(after) as (keyof Posting)[]) {
    if (before[key] !== after[key]) {
      (patch as Record<string, unknown>)[key] = after[key];
    }
  }
  return patch;
}
