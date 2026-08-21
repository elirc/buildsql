## Hint 1
A request has three visible outcomes and the component has to be able to render
all of them: not finished yet, finished with data, finished with an error.
Exercise 1 only asks for the first two, so you need one more piece of state
alongside `user`.

## Hint 2
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  fetchUser(userId).then((result) => {
    setUser(result);
    setLoading(false);
  });
}, [/* … */]);
```

Starting at `true` matters: the very first render happens before the effect
runs, so a `loading` that starts `false` shows an empty card for one frame.

## Hint 3
Render the loading case as a live region — `<p role="status">Loading</p>` — so
that somebody using a screen reader is told the wait is happening rather than
being handed silence. The last decision is the shape of the render: an early
return per state reads better than one deeply nested ternary, and it makes the
error case in ex2 easy to slot in.
