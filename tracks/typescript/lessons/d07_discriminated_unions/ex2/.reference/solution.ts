// d07_discriminated_unions / ex2 - reference solution (author only).

export interface MachineState {
  credit: number;
  dispensed: readonly string[];
  message: string;
}

export type Action =
  | { type: "coin"; cents: number }
  | { type: "buy"; slot: string; price: number }
  | { type: "refund" };

export function reduce(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "coin": {
      const credit = state.credit + action.cents;
      return { ...state, credit, message: `credit ${credit}c` };
    }
    case "buy": {
      if (state.credit < action.price) {
        return { ...state, message: `need ${action.price - state.credit}c more` };
      }
      return {
        credit: state.credit - action.price,
        dispensed: [...state.dispensed, action.slot],
        message: `dispensed ${action.slot}`,
      };
    }
    case "refund":
      return { ...state, credit: 0, message: `refunded ${state.credit}c` };
  }
}
