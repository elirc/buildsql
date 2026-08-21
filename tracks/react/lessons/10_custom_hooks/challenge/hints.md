## Hint 1
Everything in this hook is something you have already written — lesson 07's
three states, lesson 07's cleanup guard, lesson 07's "callable from two places"
problem. The new part is that it is a *hook*, so nothing here renders anything
and the return value is the whole API.

## Hint 2
Start with the effect: set the status to loading, call `run()`, and record
either the data or the error's message.

```tsx
useEffect(() => {
  let current = true;
  …
  return () => { current = false; };
}, [run, attempt]);
```

The `attempt` in that array is the trick for `reload`. Keep a counter in state
and have `reload` increment it; the effect is watching, so it runs again.

## Hint 3
Three details separate a working version from a good one. Check the `current`
flag in both the `.then` **and** the `.catch`, or a stale failure can still
overwrite a fresh success. Wrap `reload` in `useCallback` so consumers can put
it in their own dependency arrays. And note the contract in the file header:
`run` goes in the dependency array, so a caller who passes an inline arrow gets
an infinite loop — worth deciding whether you would document that, assert it, or
design around it.
