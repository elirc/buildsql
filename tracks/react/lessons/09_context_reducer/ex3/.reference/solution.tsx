// 09_context_reducer / ex3 - reference solution.

export type CartItem = { id: string; name: string; price: number; quantity: number };

export type CartAction =
  | { type: "added"; id: string; name: string; price: number }
  | { type: "removed"; id: string }
  | { type: "quantitySet"; id: string; quantity: number }
  | { type: "cleared" };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "added": {
      const existing = state.find((item) => item.id === action.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...state, { id: action.id, name: action.name, price: action.price, quantity: 1 }];
    }
    case "removed":
      return state.filter((item) => item.id !== action.id);
    case "quantitySet":
      if (action.quantity <= 0) {
        return state.filter((item) => item.id !== action.id);
      }
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: action.quantity } : item,
      );
    case "cleared":
      return [];
    default:
      return state;
  }
}
