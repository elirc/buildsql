## Hint 1

"What can an `interface` do that a `type` alias cannot?" is a top-five
TypeScript interview question, and this exercise is the answer in code. Declare
the same interface twice and the members combine; try that with a `type` alias
and you get "Duplicate identifier".

Add the `fail` event as a *second* declaration rather than by editing the first
one, because that is the trick being tested.

## Hint 2

```ts
export interface DojoEvents {
  pass: { exercise: string };
}

export interface DojoEvents {
  fail: { exercise: string; message: string };
}
// keyof DojoEvents is now "pass" | "fail"
```

That is how libraries let you extend their types from your own code - and how
`declare global { interface Window { ... } }` works.

In the function, `K` is a single literal at each call site, but inside the body
it is still generic, so TypeScript cannot narrow `payload` from a comparison on
`event`. A cast after checking the event name is the conventional escape; keep
it to one line per branch.

## Hint 3

Add the second `interface DojoEvents` declaration with the `fail` member. In
the body, branch on `event === "fail"`, cast `payload` to `DojoEvents["fail"]`
and return the fail wording; otherwise cast to `DojoEvents["pass"]` and return
the pass wording. Both strings are in the README.

Left to you: whether an overload or a discriminated-union parameter would be
better than the cast. Both are real answers - and being able to say why the cast
is needed *here* is what the question is actually probing.
