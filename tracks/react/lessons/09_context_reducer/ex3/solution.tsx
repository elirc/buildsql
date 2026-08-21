// 09_context_reducer / ex3 - a reducer is a pure function.
// See tracks/react/lessons/09_context_reducer/README.md, "Exercise 3".

export type CartItem = { id: string; name: string; price: number; quantity: number };

export type CartAction =
  | { type: "added"; id: string; name: string; price: number }
  | { type: "removed"; id: string }
  | { type: "quantitySet"; id: string; quantity: number }
  | { type: "cleared" };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "added":
      return state;
    case "removed":
      return state;
    case "quantitySet":
      return state;
    case "cleared":
      return state;
    default:
      return state;
  }
}
