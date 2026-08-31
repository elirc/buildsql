## Hint 1

Split the job in two: a helper that produces the *union of parameter names*,
and a one-line mapped type that turns that union into an object. Trying to
build the object during the recursion means intersecting object types, which
works and reads much worse.

## Hint 2

The helper needs two patterns, in this order: `` `${string}:${infer Param}/${infer Rest}` ``
for a parameter with more path after it, then `` `${string}:${infer Param}` ``
for the last one. The leading `${string}` skips whatever came before the colon.

## Hint 3

The base case is `never`, and it is doing real work: mapping over `never`
produces an object with no keys, which is exactly what a path with no
parameters should give you.

Left to you: whether the helper is exported. The gate only asks about
`RouteParams`, so this is a question about what you want the public surface to
be.
