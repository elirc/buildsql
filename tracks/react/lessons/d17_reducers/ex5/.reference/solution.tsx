// d17_reducers / ex5 - reference solution.

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
      // The three decisions differ only in the word, so they share a branch.
      const status = action.type;
      const current = state.tickets.find((ticket) => ticket.id === action.id);
      if (current === undefined || current.status === status) return state;

      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          // A copy for the one that changed; the same object for every other
          // row, so a memoized list has no reason to redraw them.
          ticket.id === action.id ? { ...ticket, status } : ticket,
        ),
      };
    }
    default: {
      // Unreachable if the union is honest - which is the point. An action
      // that gets here is a bug in the caller, and a silent `return state`
      // hides it behind a button that does nothing.
      const unexpected = action as { type: string };
      throw new Error(`moderationReducer: unknown action type ${unexpected.type}`);
    }
  }
}
