## Hint 1

`NewEntry.Owner` is bait. The owner of a new entry is whoever the token says is
calling, and there is no request in which the body gets a say.

## Hint 2

The scheme sets `NameClaimType = "sub"`, so `user.Identity?.Name` is the
subject. Pass that to `vault.Add(...)`, validate the title first
(`TypedResults.ValidationProblem` keyed `"title"`), and answer
`TypedResults.Created($"/d20/entries/{entry.Id}", ...)`.
