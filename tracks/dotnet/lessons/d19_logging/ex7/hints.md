## Hint 1

Five outcomes, five `return`s, one log call on each. Read
`http.TraceIdentifier` once at the top into a local and put it in every
template as `{TraceId}` - it is per request, which is the whole point.

## Hint 2

The levels are ex2's rule again. A rejected request and a missing order are
`LogInformation` - the server did exactly what it should. An over-weight parcel
is `LogWarning`: valid request, awkward world. A carrier that throws is
`LogError`, with the exception in its own parameter.

## Hint 3

The order of the checks matters: validate (`orderRef` blank, `weightKg` under
1, both keys at once), then look the order up, then the weight limit, then call
`D19Dispatch.Book` inside a `try`.

Success is
`TypedResults.Created($"/d19/shipments/{reference}", new ShipmentAccepted(...))`
with the reference `Book` returned. The 500 body must not mention the carrier's
api key.
