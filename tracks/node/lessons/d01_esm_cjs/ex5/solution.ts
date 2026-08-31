// d01_esm_cjs / ex5 - live bindings versus copied values.
// See lessons/d01_esm_cjs/README.md, "Problem 5".
//
// Two modules next door hold the same counter: ./tally (ESM) and ./tally.cjs
// (CommonJS). Read the total three ways, add 5 through both modules, and read
// the same three ways again.

export interface TallyReadings {
  /** the ESM import, read before and after */
  esm: [number, number];
  /** a name destructured out of the require(), read before and after */
  cjsCopy: [number, number];
  /** the same number read as a property of the exports object */
  cjsProperty: [number, number];
}

export function readTwice(): TallyReadings {
  throw new Error("ex5: readTwice() is not implemented yet - edit this file.");
}
