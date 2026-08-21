## Hint 1

Both functions have to agree about a number and neither of them is given it,
so the number has to live somewhere they can both reach: outside the
functions, at the top level of the module.

The reason that works - the reason the gate can import your module twice and
still see one counter - is the thing this exercise is really teaching. Reread
the "a module is evaluated once" part of the README before you write anything.

## Hint 2

Declare the state with `let` at module scope, above both functions. `nextId`
moves it on by one and returns the string built from the new value;
`idsIssued` just reports it.

Watch the off-by-one: the first id is `job-1`, not `job-0`. Increment before
you build the string, or start the counter at 1 and increment after - pick one
and be consistent.

## Hint 3

The shape:

```ts
let issued = /* what starting value? */;

export function nextId(): string {
  /* move the counter, then return a template literal */
}
```

Do not export `issued` itself and do not wrap it in an object you export -
exported bindings are live views of the module variable, and handing the
counter out is how someone else ends up resetting it. The decision left to you
is where the increment goes relative to the `return`.
