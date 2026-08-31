// d02_functions_signatures / ex6 - a factory that returns methods over state.
// See lessons/d02_functions_signatures/README.md, "ex6".

export interface Counter {
  next(): number;
  peek(): number;
  reset(): void;
}

export function makeCounter(start?: number): Counter {
  throw new Error("ex6: makeCounter() is not implemented yet - edit this file.");
}
