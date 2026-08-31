## Hint 1

Four outcomes and three of them are refusals. Two of those refusals must be
impossible to tell apart from outside: "there is no such ticket" and "it is not
yours". If a caller can distinguish them, they can enumerate your ids.

## Hint 2

Load the ticket with `FirstOrDefaultAsync`, then write the two misses as one
condition: `ticket is null || (!curator && ticket.Holder != holder)` returning
`TypedResults.NotFound()`.

The already-cancelled case is `TypedResults.Problem` with 409 and
`type: D24Problems.Base + "already-cancelled"`. The success sets `Cancelled`,
awaits `SaveChangesAsync`, and returns `TypedResults.NoContent()`.

## Hint 3

Exactly one log entry per request, so log on each of the three paths and only
there. The level is a claim about whose problem it is: a caller asking for a
ticket that is not available is `Information`, and repeating work that was
already done is `Warning`. Nothing here is `Error`.
