// d08_literals_const_enums / ex5 - keyof typeof over a const table.
// See lessons/d08_literals_const_enums/README.md, "ex5".
//
// Two fixes: the table needs `as const`, and Speed should be derived from it
// rather than written out (or, as here, given up on entirely).

export const PRICES = { standard: 500, express: 1200, overnight: 2500 };

export type Speed = string;

export function priceOf(speed: Speed): number {
  throw new Error("ex5: priceOf() is not implemented yet - edit this file.");
}

export function cheapest(): Speed {
  throw new Error("ex5: cheapest() is not implemented yet - edit this file.");
}
