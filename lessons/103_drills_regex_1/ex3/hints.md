## Hint 1

You want the matched text, not a yes/no - so this is not the `~` operator
but the function that returns the matching substring.

## Hint 2

`substring(name FROM '[0-9]+$')` - the `FROM pattern` form, not the
`FROM ... FOR ...` positional one. The `$` is what makes it the trailing
run of digits.
