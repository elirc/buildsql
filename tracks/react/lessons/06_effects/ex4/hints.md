## Hint 1
`fetchUser` returns a promise, so this cannot happen during render — rendering
must be synchronous and must not have side effects. Kick the request off in an
effect and put the result in state; the state change is what re-renders the
name into view.

## Hint 2
```tsx
useEffect(() => {
  fetchUser(userId).then((result) => setUser(result));
}, [/* … */]);
```

The dependency array is the whole exercise. Leave it out and every render
fetches, every fetch sets state, every state change renders — an infinite loop
that will hammer a real API. List the values the effect reads.

## Hint 3
There is one more thing worth adding even though the gate does not force it
here: if the component unmounts (or the id changes) while a request is in
flight, the `.then` still runs and calls `setUser` on a component that has
moved on. A cleanup that flips a local `cancelled` flag, checked before setting
state, is the standard guard — and lesson 07 turns that idea into a full race
condition you have to defeat.
