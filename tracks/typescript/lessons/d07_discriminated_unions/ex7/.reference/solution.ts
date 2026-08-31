// d07_discriminated_unions / ex7 - reference solution (author only).

export type DoorState =
  | { state: "closed" }
  | { state: "open"; since: number }
  | { state: "locked"; code: string };

export type DoorEvent =
  | { event: "open"; at: number }
  | { event: "close" }
  | { event: "lock"; code: string }
  | { event: "unlock"; code: string };

export function transition(state: DoorState, event: DoorEvent): DoorState {
  switch (state.state) {
    case "closed":
      if (event.event === "open") {
        return { state: "open", since: event.at };
      }
      if (event.event === "lock") {
        return { state: "locked", code: event.code };
      }
      return state;
    case "open":
      if (event.event === "close") {
        return { state: "closed" };
      }
      return state;
    case "locked":
      if (event.event === "unlock" && event.code === state.code) {
        return { state: "closed" };
      }
      return state;
  }
}
