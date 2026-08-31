// d24_mixed_gauntlet / ex7 - reference solution (author only).

export type CartEvent =
  | { type: "added"; sku: string; qty: number }
  | { type: "removed"; sku: string }
  | { type: "quantity"; sku: string; qty: number }
  | { type: "cleared" };

export interface CartLine {
  readonly sku: string;
  readonly qty: number;
}

export interface CartState {
  readonly lines: readonly CartLine[];
}

export function assertNever(value: never): never {
  throw new Error("assertNever: unhandled value " + String(value));
}

export function reduceCart(state: CartState, event: CartEvent): CartState {
  switch (event.type) {
    case "added": {
      const existing = state.lines.find((line) => line.sku === event.sku);
      if (existing === undefined) {
        return { lines: [...state.lines, { sku: event.sku, qty: event.qty }] };
      }
      return {
        lines: state.lines.map((line) =>
          line.sku === event.sku ? { sku: line.sku, qty: line.qty + event.qty } : line,
        ),
      };
    }
    case "removed":
      return { lines: state.lines.filter((line) => line.sku !== event.sku) };
    case "quantity": {
      if (!state.lines.some((line) => line.sku === event.sku)) {
        return state;
      }
      if (event.qty <= 0) {
        return { lines: state.lines.filter((line) => line.sku !== event.sku) };
      }
      return {
        lines: state.lines.map((line) =>
          line.sku === event.sku ? { sku: line.sku, qty: event.qty } : line,
        ),
      };
    }
    case "cleared":
      return { lines: [] };
    default:
      return assertNever(event);
  }
}
