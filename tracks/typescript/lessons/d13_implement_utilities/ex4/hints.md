## Hint 1

Pattern-match the function type with a conditional, and put `infer` where the
parameters sit: `F extends (<something here>) => unknown ? ... : never`.

## Hint 2

Rest syntax collects the whole list: `(...args: infer P)` binds `P` to the
parameter tuple - labels, arity and optionality included. Return `P` in the
true branch; a non-function has no parameters, which is what the `never` arm
says.
