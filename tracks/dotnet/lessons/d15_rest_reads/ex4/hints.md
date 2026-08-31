## Hint 1

Delete the parsing. Two URLs that mean two different things deserve two routes,
and the router is better at telling them apart than an `if` is.

## Hint 2

`app.MapGet("/d15/bikes/available", ...)` and
`app.MapGet("/d15/bikes/{id:int}", ...)`. A literal segment outranks a
parameter segment, so the order of the two lines does not matter.

The `:int` is what makes `/d15/bikes/abc` a 404: no endpoint matches, so
routing answers before any handler of yours runs. With the constraint left off,
that URL reaches your code and you are back to parsing.
