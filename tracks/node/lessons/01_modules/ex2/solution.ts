// 01_modules / ex2 - calling a CommonJS module from an ES module.
// See lessons/01_modules/README.md, "Exercise 2".
//
// legacy-pricing.cjs sits next to this file. It exports:
//   RATES        an object of region -> tax rate
//   priceWithTax (cents: number, region: string) => number

export function checkout(cents: number, region: string): number {
  throw new Error("ex2: checkout() is not implemented yet - edit this file.");
}

export function regions(): string[] {
  throw new Error("ex2: regions() is not implemented yet - edit this file.");
}
