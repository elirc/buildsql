## Hint 1
Right now the fetching lives inside the effect, and an effect cannot be called
from a click handler. So the first move is structural: lift the whole "start a
request and record what happens" routine into a function that both the effect
and the button can call.

## Hint 2
```tsx
function load() {
  setLoading(true);
  setError(null);
  fetchUser(userId).then(…).catch(…).finally(…);
}

useEffect(() => {
  load();
}, [/* … */]);
…
<button type="button" onClick={load}>Try again</button>
```

Clearing the previous error at the *start* of `load` is what makes the alert
disappear when the retry succeeds.

## Hint 3
There is a wrinkle. A plain `function load()` is a brand-new function on every
render, so putting it in the effect's dependency array would refetch forever,
and leaving it out is the lie the linter warns about. `useCallback(fn, [deps])`
hands back the same function until its own dependencies change, which makes the
dependency array honest. It is properly taught in lesson 11 — for now, wrap
`load` in it and list what `load` reads.
