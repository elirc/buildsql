## Hint 1

Two lookups, and they want different methods. One is by primary key; the other
is by a column that is not the key, and only one of the two EF methods can do
that.

Both handlers are the same two-branch shape as every "find or 404" you have
written.

## Hint 2

`await db.Members.FindAsync(id)` for the key — it also answers straight from the
change tracker when that row is already loaded, with no round trip.

`await db.Members.FirstOrDefaultAsync(m => m.Email == email)` for the email:
`FindAsync` only understands primary keys.

Use `FirstOrDefault`, not `First`. `First` throws when nothing matches, and a
thrown exception is a 500 where you wanted a 404.
