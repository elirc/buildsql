// d18_context_reducer_apps / ex2 - reference solution.
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

type WishlistState = { items: string[] };

type WishlistAction = { type: "toggled"; item: string };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  return state.items.includes(action.item)
    ? { items: state.items.filter((item) => item !== action.item) }
    : { items: [...state.items, action.item] };
}

const WishlistContext = createContext<{
  items: string[];
  dispatch: Dispatch<WishlistAction>;
} | null>(null);

function useWishlist() {
  const value = useContext(WishlistContext);
  if (value === null) throw new Error("useWishlist must be used inside a WishlistProvider");
  return value;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  return (
    <WishlistContext.Provider value={{ items: state.items, dispatch }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function WishlistToggle({ item }: { item: string }) {
  const { items, dispatch } = useWishlist();
  // Derived, not stored. There is exactly one answer to "is the kettle saved",
  // and it lives in the provider - so every toggle for the kettle reads it.
  const saved = items.includes(item);

  return (
    <button type="button" onClick={() => dispatch({ type: "toggled", item })}>
      {saved ? "Saved" : "Save"} {item}
    </button>
  );
}

export function WishlistCount() {
  const { items } = useWishlist();
  return <p role="status">{items.length} saved</p>;
}
