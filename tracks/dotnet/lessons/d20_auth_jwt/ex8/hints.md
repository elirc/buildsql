## Hint 1

Nothing new - ex5's scope check, ex4's 404 rule, ex3's validation, and ex3's
owner trap. What is graded is the ORDER.

## Hint 2

What the token permits, then what it may see, then what it sent:

1. no `D20Scopes.Write` - `TypedResults.Forbid(authenticationSchemes: [D20Jwt.Scheme])`
2. missing, or somebody else's and not a keeper - `NotFound()`
3. blank title - `ValidationProblem` keyed `"title"`
4. otherwise assign and `NoContent()`

## Hint 3

Validating first would tell a caller with no rights at all which of their fields
were malformed, which is a small information leak and a confusing status.

And `body.Owner` is never assigned. This is where the trap usually survives: an
update path that copies every field of the DTO onto the entity hands the row to
whoever asked for it.
