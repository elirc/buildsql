## Hint 1
This is a search box, so the query changes on almost every keystroke and
several requests are always in flight. The one that answers last wins the
screen, and "last" has nothing to do with which query the user is actually
looking at.

## Hint 2
Same shape as ex3: a flag local to each effect run, flipped by that run's
cleanup, checked before the state update.

```tsx
useEffect(() => {
  let current = true;
  …
  return () => { current = false; };
}, [query, fetchResults]);
```

## Hint 3
Note what the flag has to be: a `let` declared *inside* the effect body, not a
`useRef` and not a module variable. Each effect run needs its own, so that the
cleanup for the `re` request can retire that request without touching the one
for `react`. Whether you would also debounce the query before fetching at all
is the next question — and it is exactly what lesson 10 builds.
