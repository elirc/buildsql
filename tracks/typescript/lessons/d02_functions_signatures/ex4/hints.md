## Hint 1

Two changes. `Formatter` has to promise a `string`, not `unknown` - a type that
accepts everything checks nothing. And the default belongs in the signature,
where callers can see it, rather than inside an `if` in the body.

## Hint 2

`format: Formatter = (value) => value.toFixed(2)` is both the annotation and the
default. A parameter with a default is optional to the caller and *not*
optional inside the body, which is why the loop needs no branch at all.

Left to you: `values.map(format)` or `values.map((value) => format(value))`.
One of those quietly passes the index as a second argument - decide whether
that matters here, and whether it would in general.
