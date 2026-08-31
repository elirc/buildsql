## Hint 1

The update is shorter than you expect — there is no `Update` call in it at all.
Load the entity, assign to the property, save.

The delete is the mirror image: you can only `Remove` something you loaded,
which is why "delete something that is not there" is a 404.

## Hint 2

```csharp
var member = await db.Members.FindAsync(id);
if (member is null) { return TypedResults.NotFound(); }

member.Credits = request.Credits;
await db.SaveChangesAsync();
```

The change tracker noticed the assignment and works out the `UPDATE` itself.
`db.Update(member)` on a tracked entity marks *every* property modified, so it
writes columns you never touched.

Validate the negative credits before the lookup, so a bad body is a 400 whatever
the id is.
