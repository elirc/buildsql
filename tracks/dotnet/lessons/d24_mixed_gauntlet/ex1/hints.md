## Hint 1

Two questions are being answered inside one handler that should have been
answered by the router: "is `open` a resource or an id?" and "is `abc` an id at
all?" Routing can answer both on its own - a literal segment and a route
constraint are the two tools.

## Hint 2

Register two routes. One with the literal segment `open`, one with
`{id:int}`. A literal outranks a parameter, so the order you write them in does
not matter, and `:int` means `abc` matches nothing and the framework answers 404
before your code runs - so neither handler needs `int.TryParse`.

The `open` handler filters on `Capacity > 0` and orders by `Name`; the by-id
handler uses `FirstOrDefaultAsync`, not `FirstAsync`.
