// d24_mixed_gauntlet / ex7 - an exhaustive, immutable reducer.
// See lessons/d24_mixed_gauntlet/README.md, "ex7".
//
// The stub has a mutable state type and an assertNever that
// accepts anything, so neither the immutability nor the exhaustiveness is real.

export type CartEvent =
  | { type: "added"; sku: string; qty: number }
  | { type: "removed"; sku: string }
  | { type: "quantity"; sku: string; qty: number }
  | { type: "cleared" };

export interface CartState {
  lines: { sku: string; qty: number }[];
}

export function assertNever(value: unknown): void {
  throw new Error("ex7: assertNever() is not implemented yet - edit this file.");
}

export function reduceCart(state: CartState, event: CartEvent): CartState {
  throw new Error("ex7: reduceCart() is not implemented yet - edit this file.");
}
