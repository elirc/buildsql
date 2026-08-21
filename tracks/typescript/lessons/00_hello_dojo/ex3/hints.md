## Hint 1

This exercise has two halves and they fail independently.

The runtime half: get the digits off the front of the slug and turn them into
a number. Note that `"13_async_await"` has two underscores, so "everything
before the last underscore" is the wrong rule — you want the first segment.

The type half: the stub has no return-type annotation, so TypeScript is
currently inferring `never` from the `throw`. Read the ex3 paragraph of the
README again and decide what the function's declared return type should be.

## Hint 2

For the runtime half, `String.prototype.split` turns `"07_generics_2"` into an
array of segments; the piece you want is the first one. Then convert that
string of digits to a number — `Number.parseInt(text, 10)` is the explicit
way, and passing the radix `10` is a habit worth forming.

For the type half: the annotation goes after the parameter list, before the
opening brace, exactly like `greet` in ex1.

Check yourself on `"00_hello_dojo"` before you run the gate. What does
parsing `"00"` give you, and is that what the gate asks for?

## Hint 3

The shape is:

```ts
export function parseLessonNumber(slug: string)/* <- something is missing here */ {
  return Number.parseInt(slug.split(/* what separator? */)[0], 10);
}
```

Two decisions left for you: which single-character separator to split on, and
which type to write where the comment is. If you get the value right and the
gate still shows a red `ex3`, look at the *type* error — it names the line in
`gate.test-d.ts` that is unhappy, and the fix is the annotation, not the body.
