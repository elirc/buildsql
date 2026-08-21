// 08_utility_types / ex4 - types derived from functions.
// See lessons/08_utility_types/README.md, "Exercise 4".
//
// `Loaded` should be the value inside the promise, not the promise. And
// once() currently throws its argument's types away.

export type Loader = () => Promise<{ id: string; title: string }>;

export type Loaded = ReturnType<Loader>;

export function once(fn: (...args: any[]) => any): (...args: any[]) => any {
  throw new Error("ex4: once() is not implemented yet - edit this file.");
}
