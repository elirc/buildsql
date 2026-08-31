## Hint 1

`typeof null` is `"object"`. Every object guard in JavaScript starts by ruling
that out, and the gate checks it first for exactly that reason.

## Hint 2

The second guard should call the first. Once `isRecord(value)` has returned
`true`, `value` is a `Record<string, unknown>` inside the `&&`, so
`Object.values(value)` typechecks with no cast.

Left to you: whether arrays should count as records. The prompt says no; note
that `typeof []` is `"object"` too, so saying no takes a line.
