// d17_reducers / ex2 - an array you were handed is not yours to push onto.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 2".

export type SeatingState = { chosen: string[]; capacity: number };

export type SeatingAction = { type: "toggled"; seat: string } | { type: "cleared" };

export function seatingReducer(state: SeatingState, action: SeatingAction): SeatingState {
  switch (action.type) {
    case "toggled":
      state.chosen.push(action.seat);
      return { ...state };
    case "cleared":
      return { ...state, chosen: [] };
  }
}
