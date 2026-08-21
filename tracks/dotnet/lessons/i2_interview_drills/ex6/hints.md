## Hint 1

Delete the loop. Every iteration is a round trip, and there are six tasks.

What replaces it is one query whose `Select` names the three things the response
needs — and one of those three lives on a different table.

## Hint 2

`TaskItem` has a `Project` navigation. Inside a projection you can walk it:
`t.Project!.Name` becomes an `INNER JOIN` in the generated SQL.

The `!` is only there to satisfy nullable reference types; nothing is
dereferenced at runtime, because the lambda is an expression tree EF translates
rather than code it runs.

Keep the `OrderBy(t => t.Id)` before the `Select`, and end with one
`ToListAsync()`.

## Hint 3

```csharp
var overview = await db.Tasks
    .OrderBy(t => t.Id)
    .Select(t => new TaskWithProject(t.Id, t.Title, t.Project!.Name))
    .ToListAsync();
```

One `await`, one command. Before you move on, have an answer ready for "how
would you have caught this in review" — the honest one is that you would not
have, which is why the answer is a query-count assertion in a test.
