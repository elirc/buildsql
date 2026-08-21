## Hint 1
Two halves. On the way in, the stored value has to be found *before the first
render paints*, or the user sees the default flash and then the real value. On
the way out, every write has to reach both React and storage.

## Hint 2
`useState` accepts a **function** as its argument, and calls it only on the
first render:

```tsx
const [value, setValue] = useState<T>(() => {
  const stored = localStorage.getItem(key);
  …
});
```

That is the lazy initialiser, and it is the right tool for anything expensive
or side-effecting. `useState(localStorage.getItem(key))` would read storage on
every single render and throw the result away.

## Hint 3
Storage holds strings, so `JSON.stringify` on the way out and `JSON.parse` on
the way in — that is what makes the hook work for objects and numbers, not just
strings. Two failure cases are worth a thought: `getItem` returns `null` when
the key is absent (and `JSON.parse(null)` is not an error, which makes it a
nasty one), and stored JSON can be corrupt. Wrap the setter in `useCallback` for
the same reason as ex1, and decide for yourself what its dependencies are.
