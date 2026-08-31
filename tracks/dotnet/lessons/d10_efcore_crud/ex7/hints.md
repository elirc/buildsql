## Hint 1

One lookup decides everything: does a member with that email exist? If yes,
replace their fields and answer 204. If no, create one and answer 201 with a
Location.

Validate before either branch.

## Hint 2

`await db.Members.FirstOrDefaultAsync(m => m.Email == email)` — the email comes
from the route, not from the body, because the URL is what names the resource.

The create branch is ex3's: build the member with `Email = email` and
`Grade = "white"`, `Add`, save, then read `member.Id` for the Location.

The replace branch is ex4's: assign, save, 204. Nothing new is created, which is
why there is no Location on it.

Note there is no `credits` field on the create path that the client did not
send, and no `email` field on the replace path it could change — enumerate what
you accept.
