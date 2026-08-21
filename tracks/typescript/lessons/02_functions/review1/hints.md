## Hint 1

The gate calls this with one, two and three arguments. Two of the three
parameters therefore need defaults, and the README names both values.

The behaviour question is what happens when the text is already at least as
wide as the cell. Truncating is a defensible design; it is not this one.

## Hint 2

`String.prototype.repeat(n)` throws for a negative `n`, so work out the number
of filler characters *after* you have handled the "already wide enough" case.

Defaults are inferred: `filler = "."` gives `filler` the type `string`, not the
literal type `"."`, because a default parameter is a mutable binding.

## Hint 3

Give `width` a default of `8` and `filler` a default of `"."`, return `text`
unchanged when `text.length >= width`, and otherwise append
`filler.repeat(width - text.length)`.

Left to you: what happens if someone passes a two-character filler. The gate
does not test it, which means you get to decide - and to notice that the
signature you wrote does not stop them.
