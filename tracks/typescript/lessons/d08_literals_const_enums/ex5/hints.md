## Hint 1

Two steps to the type. `typeof PRICES` is the type of the object; `keyof` that
is the union of its keys. `as const` is what stops the values widening to
`number` - which the type gate checks by asking whether `PRICES.express` is
exactly `1200`.

## Hint 2

`cheapest()` has to read the table, not repeat its answer. `Object.keys` is
typed `string[]` on purpose - a value may always have more properties than its
type declares - so one cast to `Speed[]` is the accepted answer.

Seed the running best from a real key rather than from `undefined`, and the
loop stays one comparison long.

Left to you: the loop, or `Object.entries(PRICES).sort(...)[0][0]`. The second
is one line and loses the key literals - decide whether that matters here.
