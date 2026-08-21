## Hint 1

One code path, two behaviours, and the only difference is how the row was
loaded. Do not put an `if` around the save.

Build the query first, branching on `tracked`; everything after that is
identical.

## Hint 2

```csharp
IQueryable<TaskItem> query = tracked ? db.Tasks.AsQueryable() : db.Tasks.AsNoTracking();
```

Then `FirstOrDefaultAsync(t => t.Id == id)`, a 404 on null, `task.Done = true`,
and capture the `int` that `await db.SaveChangesAsync()` returns.

There is no `Update` call. For a tracked entity, assigning to the property *is*
the edit.

## Hint 3

```csharp
task.Done = true;
int changes = await db.SaveChangesAsync();
return TypedResults.Ok(new CompleteResult(changes, task.Done));
```

`changes` is 1 when tracked and 0 when not, and the row only moves in the first
case. If both come back as 1, the `tracked` flag is not reaching the query.
