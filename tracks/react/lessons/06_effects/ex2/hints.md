## Hint 1
The stub's effect has no second argument at all, which means "run after every
render". Changing an unrelated prop re-renders the component, so the effect
fires again — and the outside world is told the theme changed when it did not.

## Hint 2
The second argument is an array of the values the effect *reads from the
render*. React compares each one with `Object.is` against the previous run and
skips the effect when they are all the same.

```tsx
useEffect(() => {
  onSync(theme);
}, [/* … */]);
```

## Hint 3
Read the effect body and list everything in it that comes from props, state or
anything else defined inside the component. There are two such values here, not
one — and including the second is not paranoia: if the parent passed a
different function next time, an effect that skipped would call the wrong one
forever. Whether you can get away with omitting it, and what it would cost, is
worth thinking through before you decide.
