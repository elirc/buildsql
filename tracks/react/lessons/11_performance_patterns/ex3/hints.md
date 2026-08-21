## Hint 1
`compute(rows)` runs during every render, including the renders caused by
opening and closing the details — which have nothing to do with the numbers.
Pretend `compute` takes 200ms and the problem becomes obvious.

## Hint 2
`useMemo(factory, deps)` calls the factory on the first render and then only
again when a dependency changes; in between it hands back the value it already
had:

```tsx
const total = useMemo(() => compute(rows), [/* … */]);
```

Note the shape: `useMemo` takes a *function that returns the value*, not the
value. `useMemo(compute(rows), […])` calls it immediately every render, which
is exactly what you are trying to avoid.

## Hint 3
List everything the factory reads from this render — there are two things, not
one. Then note the sharp edge: `rows` is an array, compared by identity, so a
parent that writes `<Report rows={[1, 2, 3]} …/>` inline gets a new array every
render and no memoization at all. Deciding whose problem that is — the parent's
or `Report`'s — is a real API design question.
