// d17_reducers / ex2 - reference solution.

export type SeatingState = { chosen: string[]; capacity: number };

export type SeatingAction = { type: "toggled"; seat: string } | { type: "cleared" };

export function seatingReducer(state: SeatingState, action: SeatingAction): SeatingState {
  switch (action.type) {
    case "toggled": {
      if (state.chosen.includes(action.seat)) {
        // Giving a seat up is always allowed, capacity or not.
        return { ...state, chosen: state.chosen.filter((seat) => seat !== action.seat) };
      }
      // The rule the reducer owns: a refusal changes nothing, and the way to
      // say "nothing" is the state itself.
      if (state.chosen.length >= state.capacity) return state;
      return { ...state, chosen: [...state.chosen, action.seat] };
    }
    case "cleared":
      return state.chosen.length === 0 ? state : { ...state, chosen: [] };
  }
}
