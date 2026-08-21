## Hint 1
`Child` is already wrapped in `memo`, and it still renders on every click of
Bump. So the shallow prop comparison must be failing. Two props go in; one of
them is the gate's spy, which never changes. Look at the other one.

## Hint 2
`function handleSelect(value) { … }` inside the component body creates a **new
function object** on every render. `Object.is(oldHandler, newHandler)` is
false, memo concludes the props changed, and the child renders.

`useCallback(fn, deps)` returns the same function object until one of its
dependencies changes:

```tsx
const handleSelect = useCallback((value: string) => { … }, [/* … */]);
```

## Hint 3
The dependency array is the part worth thinking about rather than copying. Read
the body: what does it use that comes from this render? `setPicked` is a state
setter, and React guarantees those never change identity — which tells you what
belongs in the array. Note also that `memo` on the child is what makes any of
this matter: `useCallback` around a handler passed to an un-memoized child buys
you nothing at all.
