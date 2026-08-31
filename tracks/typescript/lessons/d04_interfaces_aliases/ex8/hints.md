## Hint 1

Start with the modifiers. `readonly matches: readonly Match[]` is the pair
people miss: the first stops the property being reassigned, the second stops the
array being pushed to. The type gate has one `@ts-expect-error` for each.

## Hint 2

Two passes. First collect the winners into an array, in match order, skipping
any match whose `winner` is `undefined`. Then walk that array two at a time.

When the second index is past the end you have an odd winner: emit a match
against `""` with the `winner` already set, because there is nobody to play.

Left to you: `i += 2` over an index, or repeatedly `splice`-ing pairs off a
copy. The first does not allocate; the second reads like the bracket looks.
