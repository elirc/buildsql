## Hint 1

Delete the `foreach`. Everything inside it is a round trip to the database, and
there are two of them per project.

What replaces it is one query whose `Select` describes the finished answer —
including the two counts, which the database is much better at than you are.

## Hint 2

Inside a projection you can reach across a navigation and aggregate:

- `p.Tasks.Count` becomes a correlated `COUNT`
- `p.Tasks.Count(t => !t.Done)` becomes a second one with a `WHERE`

Neither runs in your process; both are expressions EF translates into the same
`SELECT`.

Keep `OrderBy(p => p.Id)` before the `Select`, and end with a single
`ToListAsync()`.

## Hint 3

```csharp
var summaries = await db.Projects
    .OrderBy(p => p.Id)
    .Select(p => new ProjectSummary(
        p.Id,
        p.Name,
        /* how many tasks? */,
        /* how many are not done? */))
    .ToListAsync();
```

One `await`, one command. If the gate still counts more than one, look for a
`ToListAsync()` earlier in the chain — everything after that boundary runs in
memory and has to be fetched separately.
