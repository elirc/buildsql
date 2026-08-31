// d05_unions_basics / ex5 - reference solution (author only).

export type Id = string | number;

export function idKey(id: Id): string {
  return typeof id === "number" ? `n:${id}` : `s:${id}`;
}

export function sameId(a: Id, b: Id): boolean {
  return idKey(a) === idKey(b);
}
