// d10_generic_constraints / ex1 - reference solution (author only).

export function sumOf<T extends { amount: number }>(items: readonly T[]): number {
  let total = 0;
  for (const item of items) {
    total += item.amount;
  }
  return total;
}
