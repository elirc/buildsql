## Hint 1
Three values that all read as "falsy" mean three different things here:
`undefined` is "I did not say", `null` is "I say there is none", and a string is
the answer. Only one of them should reach the default.

## Hint 2
A default parameter fires for `undefined` and for nothing else - not for
`null`, not for `""`, not for `0`. `||` fires for all of them, which is why the
stub loses the difference; `??` fires for `undefined` and `null` together,
which is not what is wanted either.

## Hint 3
The Dismiss button exists only when there is something for it to call. Decide
what your condition tests - the presence of the prop, not its truthiness - and
remember what an unlabelled `<button>` inside a form does by default.
