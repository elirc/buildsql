## Hint 1
The two consumers need different things: the label needs the current palette,
the toggle needs a way to change it. Neither takes props, so **both** have to
come down through the context — which means the context value is an object, not
a string.

## Hint 2
The provider owns the state and puts both halves in the value:

```tsx
const [palette, dispatch] = useReducer(paletteReducer, "day");
…
<PaletteContext.Provider value={{ palette, dispatch }}>{children}</PaletteContext.Provider>
```

Give yourself a `usePalette()` hook that reads the context and throws when there
is no provider, exactly as in ex2 — every consumer then gets a narrowed,
non-null value for free.

## Hint 3
There is a subtlety in that snippet worth fixing even though the gate will pass
without it: `{ palette, dispatch }` is a brand-new object on every render of the
provider, so every consumer re-renders whenever *anything* above the provider
does. `useMemo(() => ({ palette, dispatch }), [palette])` keeps the same object
until the palette actually changes. `dispatch` itself is guaranteed stable by
React, which is one of the quiet advantages of `useReducer` over `useState`
here — and lesson 11 is where memoization gets taught properly.
