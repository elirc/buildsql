## Hint 1

Two answers only. Find the row; if it is not there, say so; otherwise remove it,
save, and return the status that carries no body.

## Hint 2

`FirstOrDefaultAsync`, then either `TypedResults.NotFound()` or
`db.Jobs.Remove(job)` + `SaveChangesAsync()` + `TypedResults.NoContent()`.

Resist returning a body with the 204 - a message like `{ "deleted": 3 }` looks
friendly and directly contradicts the status line you just sent.
