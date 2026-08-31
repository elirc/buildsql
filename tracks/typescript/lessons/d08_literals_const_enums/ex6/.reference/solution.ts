// d08_literals_const_enums / ex6 - reference solution (author only).

export type Size = "s" | "m" | "l";

export type Colour = "red" | "blue";

export function sku(size: Size, colour: Colour): string {
  return `${colour}-${size}`;
}

export function parseSku(text: string): { size: Size; colour: Colour } | null {
  const parts = text.split("-");
  if (parts.length !== 2) {
    return null;
  }
  const [colour, size] = parts;
  if (colour !== "red" && colour !== "blue") {
    return null;
  }
  if (size !== "s" && size !== "m" && size !== "l") {
    return null;
  }
  return { size, colour };
}
