## Hint 1

`parseJson` is one line. The whole exercise is which type it declares, and the
type gate is explicit: reading a property off the result must *not* compile.

`readTitle` is then the price you pay for that honesty - and the point is that
it is a price worth paying, because that is where the checking happens.

## Hint 2

`JSON.parse` returns `any`, which spreads: every property of an `any` is `any`,
and nothing downstream is checked. Declaring the return type as `unknown`
converts that hole into a question the caller has to answer.

For `readTitle`, work down the value one check at a time: is it an object, is it
non-null, is `title` a string. Anything else is `null`.

## Hint 3

`parseJson` returns `JSON.parse(text)` with `unknown` as its declared return
type. `readTitle` rejects non-objects and `null`, reads `title` through a
`Record<string, unknown>` cast, and returns it only when `typeof` says it is a
string.

Left to you: whether `parseJson` should catch a `SyntaxError` from malformed
input. The gate never passes malformed text - but every real caller will, and
"who catches this" is a design decision worth making on purpose.
