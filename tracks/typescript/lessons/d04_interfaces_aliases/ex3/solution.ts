// d04_interfaces_aliases / ex3 - an interface with a call signature.
// See lessons/d04_interfaces_aliases/README.md, "ex3".
//
// Scorer has the two members and is not callable. Add the call signature.

export interface Scorer {
  label: string;
  total: number;
}

export function makeScorer(label: string): Scorer {
  throw new Error("ex3: makeScorer() is not implemented yet - edit this file.");
}
