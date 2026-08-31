// d18_context_reducer_apps / ex2 - a second copy of a fact the provider owns.
// See tracks/react/lessons/d18_context_reducer_apps/README.md, "Exercise 2".
import {
  createContext,
  useContext,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

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
  const { dispatch } = useWishlist();
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setSaved(!saved);
        dispatch({ type: "toggled", item });
      }}
    >
      {saved ? "Saved" : "Save"} {item}
    </button>
  );
}

export function WishlistCount() {
  const { items } = useWishlist();
  return <p role="status">{items.length} saved</p>;
}
