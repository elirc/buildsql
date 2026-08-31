## Hint 1

Two annotated parameters, an annotated return type, and one template literal.
The only real decision is how the number reaches exactly one decimal place.

`Math.round(celsius * 10) / 10` gives you back a *number*, and `21` stays `21`
rather than becoming `21.0`. You want a string with a fixed number of decimals.

## Hint 2

`Number.prototype.toFixed(digits)` returns a string, always with exactly that
many decimals, and it rounds on the way. So the body is a single `return` of a
template literal with `celsius.toFixed(1)` inside it.

Left to you: template literal or `+` concatenation. Pick one and use the same
one for the rest of the set.
