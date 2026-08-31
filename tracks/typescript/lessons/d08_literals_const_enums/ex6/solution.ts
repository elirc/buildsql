// d08_literals_const_enums / ex6 - narrow a string back into a literal union.
// See lessons/d08_literals_const_enums/README.md, "ex6".

export type Size = string;

export type Colour = string;

export function sku(size: Size, colour: Colour): string {
  throw new Error("ex6: sku() is not implemented yet - edit this file.");
}

export function parseSku(text: string): { size: Size; colour: Colour } | null {
  throw new Error("ex6: parseSku() is not implemented yet - edit this file.");
}
