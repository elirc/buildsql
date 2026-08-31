// d07_discriminated_unions / ex2 - a reducer over an action union.
// See lessons/d07_discriminated_unions/README.md, "ex2".
//
// Same bug as ex1: the tags are `string`, so nothing narrows.

export interface MachineState {
  credit: number;
  dispensed: readonly string[];
  message: string;
}

export type Action =
  | { type: string; cents: number }
  | { type: string; slot: string; price: number }
  | { type: string };

export function reduce(state: MachineState, action: Action): MachineState {
  throw new Error("ex2: reduce() is not implemented yet - edit this file.");
}
