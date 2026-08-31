## Hint 1

First give the two optional members real types. Then notice that they need
different treatment: a missing label becomes another *label*, but a missing year
becomes a word that is not a year at all.

## Hint 2

A destructuring default (`const { label = "independent" } = input`) fires for
`undefined` and for nothing else - which is exactly the rule the gate checks
with `label: ""`. `||` would fire for the empty string too, and would be wrong.

The year cannot use a default at all, because the replacement is a string.
Compare it against `undefined` explicitly.

Left to you: destructuring with a default, or `input.label ?? "independent"`.
They are the same rule spelled two ways.
