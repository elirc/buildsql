## Hint 1

Write the union out: four string literals joined by `|`. That is the exercise -
the rotation itself is arithmetic.

## Hint 2

Keep the four directions in one ordered array and step through it. `indexOf`
finds where you are, `+ 1` turns right, and `% length` wraps west back to north
without a special case.

Left to you: the ordered array, or a `Record<Direction, Direction>` table. The
`Record` will refuse to compile if you forget a direction - say whether that
safety is worth the extra four lines.
