## Hint 1

Two independent decisions. A SCOPE decides whether this caller may read at all
(403 if not); a ROLE decides whether the answer is everything or only their own.
Neither implies the other.

## Hint 2

Compute `bool keeper = user.IsInRole("keeper")` once, set
`http.Response.Headers["X-Result-Scope"]` from it, and put the identity into the
`Where` rather than filtering afterwards:

    .Where(e => keeper || e.Owner == user.Identity!.Name)

## Hint 3

Order the result by `Id` and project into `EntryDto`. The scope check comes
first, before the header is set - a 403 has no result to describe.
