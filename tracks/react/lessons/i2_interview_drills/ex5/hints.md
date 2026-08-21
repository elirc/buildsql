## Hint 1
The total is not state — it is the lines, added up. Compute it during render and
it can never disagree with what is on screen. Storing it means updating it in
three handlers and forgetting one.

## Hint 2
Increase and Decrease are the same operation with a different sign, so write one
function taking the id and the step. Inside it, `map` to change the matching
line and `filter` to drop anything that has reached zero — both return new
arrays, which is what React needs to see a change:

```tsx
setItems((previous) =>
  previous.map(…).filter(…),
);
```

## Hint 3
Every button must say *which* line it belongs to in its accessible name —
`Increase Apple`, not a bare `+` — or a screen-reader user hears a column of
identical controls. The remaining decisions: `toFixed(2)` is fine for a drill
but ask yourself what you would really do about money and floating point, and
what should happen to the list when it empties.
