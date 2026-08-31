## Hint 1
Ask the question that decides every one of these: could this value be worked
out from the props during the render that has them? If yes, it is not state,
and keeping it in state means keeping two copies of one fact in step.

## Hint 2
The gate counts renders with the injected `onRender` spy. An effect that sets
state renders once with the old summary and once with the new one, so the count
is the evidence - delete the state and the effect, and compute the string in a
`const` above the return.
