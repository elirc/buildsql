## Hint 1

Connection strings live at a conventional path, and there is a one-word
accessor for it. Using the convention is the point: it is what every hosting
platform writes into when an operator sets a connection string.

Then one branch: is it there or not?

## Hint 2

`configuration.GetConnectionString(name)` — exactly
`GetSection("ConnectionStrings")[name]`, with a shorter spelling.

It returns `string?`, so `string.IsNullOrEmpty` picks between
`TypedResults.NotFound()` and the 200.

Returning `""` for a missing one would push the failure down into whatever tries
to open the connection, which turns a configuration problem into a mystery three
layers away.
