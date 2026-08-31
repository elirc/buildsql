// d07_discriminated_unions / ex6 - reference solution (author only).

export type Token =
  | { kind: "number"; value: number }
  | { kind: "word"; value: string }
  | { kind: "symbol"; value: string };

export function tokenise(input: string): Token[] {
  const tokens: Token[] = [];
  for (const field of input.split(/\s+/)) {
    if (field === "") {
      continue;
    }
    const asNumber = Number(field);
    if (Number.isFinite(asNumber)) {
      tokens.push({ kind: "number", value: asNumber });
    } else if (/^[A-Za-z]+$/.test(field)) {
      tokens.push({ kind: "word", value: field });
    } else {
      tokens.push({ kind: "symbol", value: field });
    }
  }
  return tokens;
}
