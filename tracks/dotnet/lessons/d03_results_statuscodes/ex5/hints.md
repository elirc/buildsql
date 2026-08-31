## Hint 1

Three outcomes on two levels. First: is the request even well formed? That is
the 400, and it is keyed by field so a client can highlight the input that was
wrong. Only then: can this well-formed request actually be carried out? That is
the 422.

Collect every field problem before you return — do not stop at the first.

## Hint 2

Build a `Dictionary<string, string[]>` keyed `"room"` and `"nights"`, add to it
as you find problems, and return `TypedResults.ValidationProblem(errors)` if it
is non-empty. That helper is what produces the `application/problem+json`
content type and the `errors` object the gate reads.

Then `store.FindRoom(request.Room!)` — null means the request made sense and
cannot be satisfied, which is
`TypedResults.UnprocessableEntity(...)`.

The arithmetic is `room.Capacity * Desk.NightlyRatePerHead * request.Nights`.
