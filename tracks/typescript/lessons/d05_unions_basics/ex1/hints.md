## Hint 1

First narrow the parameter type to the two members this function actually
handles. A union that admits a `boolean` is a promise to render one.

Then note the two measurements are genuinely different: characters for a string,
digits for a number.

## Hint 2

`typeof value === "string"` narrows, and an early `return` leaves the rest of
the body knowing it has a number.

For the number: drop the sign with `Math.abs`, render it, and remove the decimal
point before counting - `String(Math.abs(value)).replace(".", "").length`.

Left to you: `replace(".", "")` or a regular expression that keeps only digits.
They agree for ordinary numbers and disagree for `1e21` - decide whether you
care.
