## Hint 1

One query that loads both orders, with their `Customer` navigation filled in,
and a branch that decides whether the query is tracked.

Then the whole answer is a comparison — not of names or ids, but of object
identity. C# has a method for exactly that question.

## Hint 2

Build the queryable first, the way you did in lesson 05's ex4:

```csharp
IQueryable<Order> query = tracked ? db.Orders.AsQueryable() : db.Orders.AsNoTracking();
```

Then `.Include(o => o.Customer)`, a `Where` that keeps orders 1 and 3, an
`OrderBy(o => o.Id)` so the two are in a known order, and `ToListAsync()`.

`ReferenceEquals(a, b)` asks "are these the same object", which is a different
question from `==` on entities and a very different one from comparing ids.

## Hint 3

```csharp
var first = orders[0].Customer!;
var second = orders[1].Customer!;

return TypedResults.Ok(new IdentityResult(ReferenceEquals(first, second), first.Name));
```

If both cases come back `true`, the `tracked` flag is not reaching the query.
If both come back `false`, you built the query with `AsNoTracking` on both
branches — or you ran two separate queries, in which case even tracking would
still give you one object and this would be `true`, so check that too.
