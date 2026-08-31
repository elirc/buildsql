## Hint 1

The answer is already right; the loop is the problem. Every iteration goes back
to the database twice, so eight enrolments cost seventeen commands and four
thousand would cost eight thousand and one.

Delete the loop. Say what you want in the projection instead.

## Hint 2

```csharp
await db.Enrolments
    .OrderBy(e => e.Id)
    .Select(e => new OverviewRow(e.Id, e.Student!.Name, e.Course!.Title, e.Score))
    .ToListAsync();
```

`e.Student!.Name` is a join expressed as a property access. The `!` is a message
to the compiler, not a dereference — nothing in that lambda runs in your
process, because the whole thing is an expression tree EF translates into a
`JOIN`.

The follow-up worth having ready: you catch this before production by counting
commands, either with the `Microsoft.EntityFrameworkCore.Database.Command` log
category at Information, or with a query-count assertion in a test — which is
exactly what this gate does.
