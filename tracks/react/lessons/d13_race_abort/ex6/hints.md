## Hint 1

The stub is the right idea in the wrong container. Trace the flag through two
city changes: who sets it to `true` again after a cleanup has set it to
`false`? Nobody — and a component that stops updating forever is worse than
one that shows a stale name.

## Hint 2

`useRef` gives you one box for the whole lifetime of the component. You want
one box per run of the effect, and the language already has that: a variable
declared inside the function React calls each time. Resetting the ref at the
top of the effect looks like a fix, but ask yourself what happens to the run
that was retired a moment ago.
