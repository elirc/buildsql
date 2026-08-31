## Hint 1

Three outcomes, and each one is a different kind of answer. "No such exhibit" is
a 404. "Full" is a 409, not a 400 - nothing the client sent is malformed, the
world simply cannot say yes. Only the third writes a row.

## Hint 2

Load the exhibit, then count with
`db.Tickets.CountAsync(t => t.ExhibitId == id && !t.Cancelled)` and subtract
that from `Capacity`.

Both refusals use `TypedResults.Problem(statusCode:, type:, title:, detail:,
instance:)`, and the 409 adds
`extensions: new Dictionary<string, object?> { ["seatsLeft"] = ... }`. The
success adds the ticket, awaits `SaveChangesAsync`, and only then returns
`TypedResults.Created($"/d24/tickets/{ticket.Id}", dto)` - the id does not exist
until the save.
