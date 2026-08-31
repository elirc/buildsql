// d17_reducers / ex5 - editing rows in place, and swallowing nonsense.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 5".

export type ModerationTicket = { id: string; status: "open" | "approved" | "rejected" | "escalated" };

export type ModerationState = { tickets: ModerationTicket[] };

export type ModerationAction =
  | { type: "approved"; id: string }
  | { type: "rejected"; id: string }
  | { type: "escalated"; id: string };

export function moderationReducer(
  state: ModerationState,
  action: ModerationAction,
): ModerationState {
  switch (action.type) {
    case "approved":
    case "rejected":
    case "escalated": {
      const ticket = state.tickets.find((entry) => entry.id === action.id);
      if (ticket !== undefined) {
        ticket.status = action.type;
      }
      return { ...state, tickets: [...state.tickets] };
    }
    default:
      return state;
  }
}
