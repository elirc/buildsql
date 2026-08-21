## Hint 1

None of these three values carries a `kind` property, so `switch` has nothing
to switch on. TypeScript still has two narrowing tools for exactly this
situation - one for values built by a constructor, one for plain objects that
differ in which properties they have.

Order matters: check the most specific thing first.

## Hint 2

`failure instanceof Error` narrows to `Error` and gives you `.message`. It works
because `Error` is a class with a prototype at runtime, which is also why it
does *not* work for plain object types - `instanceof { code: number }` is not
even valid syntax.

For those, the `in` operator narrows on the presence of a property:

```ts
if ("code" in failure) {
  // failure is the { code, detail } member here
}
```

## Hint 3

Widen `Failure` to `Error | { code: number; detail: string } | { timeoutMs: number }`,
then: `instanceof Error` first, `"code" in failure` second, and the timeout
case last. The three output strings are in the README, including the lowercase
`http` and the trailing `ms`.

Left to you: whether the last branch checks `"timeoutMs" in failure`
explicitly. Nothing forces you to - and it is worth asking what happens to the
unchecked version the day someone adds a fourth member.
