// d07_discriminated_unions / ex7 - two unions, one transition function.
// See lessons/d07_discriminated_unions/README.md, "ex7".

export type DoorState =
  | { state: string }
  | { state: string; since: number }
  | { state: string; code: string };

export type DoorEvent =
  | { event: string; at: number }
  | { event: string }
  | { event: string; code: string }
  | { event: string; code: string };

export function transition(state: DoorState, event: DoorEvent): DoorState {
  throw new Error("ex7: transition() is not implemented yet - edit this file.");
}
