## Hint 1

Two passes, and keeping them separate is the whole exercise. Validate every item
first, collecting nothing but a verdict; only when the whole batch is good do you
add anything.

One of the gate's cases cannot be caught by comparing items against the
database. Find it before you write the loop.

## Hint 2

Load the taken emails once, up front:

```csharp
var taken = await db.Members.Select(m => m.Email).ToListAsync();
```

…then in the loop, `taken.Add(item.Email)` after each item passes. That is what
catches two items in the same request claiming the same email — neither of them
is in the database yet, so a database-only check sees nothing wrong.

Return `TypedResults.BadRequest(new BatchError(index, "…"))` on the first
failure, from inside the loop, before anything has been added.

## Hint 3

Build the `Member` objects into a local list as you validate, then after the
loop:

```csharp
db.Members.AddRange(members);
await db.SaveChangesAsync();
var ids = members.Select(m => m.Id).ToList();
```

One `SaveChangesAsync` inserts all of them in one transaction, and the ids are
populated afterwards, in the order you added them.

Left for you: the four checks and their messages. The index is the part that
matters most — "one of your 500 rows is wrong" is not something anybody can act
on.
