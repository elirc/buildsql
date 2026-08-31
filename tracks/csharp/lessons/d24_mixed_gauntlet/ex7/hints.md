## Hint 1

Both methods have to start everything before waiting for anything, and both
have to treat a failure as something to record rather than something to
propagate.

`await Task.WhenAll(...)` rethrows only the FIRST failure - so catching it and
believing what you caught loses the rest.

## Hint 2

```csharp
Task<string>[] all = tasks.ToArray();
try { await Task.WhenAll(all); } catch (Exception) { }

List<string> successes = all.Where(t => t.IsCompletedSuccessfully).Select(t => t.Result).ToList();
List<string> failures  = all.Where(t => t.IsFaulted).Select(t => t.Exception!.InnerException!.Message).ToList();
```

Materialise with `ToArray` first, or the two `Where` calls enumerate the source
twice and may not even see the same tasks.

## Hint 3

`LookupAsync` needs the id alongside its task, so project into a pair and
materialise immediately - the `ToList` is what starts every fetch before the
first await:

```csharp
var started = ids.Select(id => new { Id = id, Task = fetch(id) }).ToList();
```

Then wait for them (awaiting each in a `try`, or `Task.WhenAll` in one, it does
not matter as long as nothing escapes), and finally filter to
`IsCompletedSuccessfully`, order by `Id` with `StringComparer.Ordinal`, and
format.

Ordering by id rather than by who answered first is what makes the same data
produce the same output on every run - which is the difference between a report
and a race.
