## Hint 1

The policy proved the token is valid. It did not prove the token is allowed to
do THIS - that is what the `scope` claim says, and nothing has looked at it.

## Hint 2

`D20Scopes.Has(user, D20Scopes.Write)` is given: it splits the claim on spaces
and compares whole words, which is why `"entries:writer"` does not pass. Never
call `Contains` on the raw claim string.

Put the check FIRST, before the entry is looked up - "may this caller publish at
all" is answerable without knowing which entry, and the gate checks that a
read-only token gets 403 even for an entry it could not have seen.
Use `TypedResults.Forbid(authenticationSchemes: [D20Jwt.Scheme])` for the 403.
