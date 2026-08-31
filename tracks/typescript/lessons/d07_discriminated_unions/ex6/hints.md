## Hint 1

Pin `"number"`, `"word"` and `"symbol"`. Notice what the tags buy here: `value`
can be a real `number` in one variant and a `string` in the other two, and no
consumer will ever have to ask `typeof`.

## Hint 2

Split on a whitespace *run* (`input.split(/\s+/)`), not on a single space, and
skip the empty fields that a leading or trailing space produces.

Then apply the three rules in the prompt's order: `Number.isFinite(Number(field))`,
then `/^[A-Za-z]+$/`, then everything else.

Left to you: the loop with `push`, or `split` + `filter` + `map`. The second is
shorter and needs the return type spelled out to infer the union.
