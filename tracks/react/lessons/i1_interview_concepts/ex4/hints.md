## Hint 1
Trace what a user sees on the first render. The component renders with
`total` at its initial value, the DOM is committed, *then* the effect runs and
sets the real total, and the component renders again. For one frame the page
said `Total: 0`.

## Hint 2
Ask the question that deletes most effects: **is this synchronising with
something outside React?** Adding up numbers you were handed is not. It is a
calculation, and calculations belong in the render body where they cannot be
out of date.

## Hint 3
So the state and the effect both go, and `total` becomes a plain `const`
computed from `items`. Nothing can then show a stale or half-updated total,
because there is nothing to keep in step. The follow-up to have ready: at what
point *would* you wrap that calculation in `useMemo`, and how would you decide?
