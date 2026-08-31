## Hint 1

Two nested loops and no `break` anywhere. The outer walks
`Object.entries(rules)`; the inner walks that path's rules; each rule that
returns an issue contributes one entry.

That ordering — path order then rule order — falls out for free, which is why
the gate can assert an exact array.

## Hint 2

The class is ex1 with a list: `super` with the counted message, `this.name`, and
the issues stored as a copy so the array the caller passed cannot change under
the error afterwards.

## Hint 3

`toJSON` is the part people have never needed until the day they do.

`JSON.stringify(new Error("boom"))` produces `{}`. An `Error`'s `message`,
`stack` and `name` are all non-enumerable, so the default serialiser finds
nothing — and a validation error that arrives at the client as an empty object
takes every issue with it. Defining `toJSON` fixes it and, at the same time,
lets you decide exactly what leaves the process. The stack does not.

The remaining decision is what `validate` should do about keys present in the
input but absent from the rules. This version ignores them; a stricter validator
would reject unknown fields, and which one you want depends on whether you are
writing an API or a config loader.
