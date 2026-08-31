## Hint 1

`Page` is `Skip` then `Take`. Write the arithmetic for page 1 first - it has to
skip nothing.

`WithinBudget` and `AfterFirstNegative` are about `TakeWhile` and `SkipWhile`,
which are **not** `Where`: they stop testing as soon as the condition first
fails (or first passes), and never look at the rest.

## Hint 2

```csharp
return source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
```

For `WithinBudget`, keep a running total in a local and let the `TakeWhile`
predicate update it:

```csharp
int spent = 0;
return costs.TakeWhile(cost => { spent += cost; return spent <= budget; }).ToList();
```

That is a lambda with state, which works here because the sequence is walked
exactly once, immediately - it would be a bug in a query you handed to somebody
else to run later.

For `AfterFirstNegative`, `SkipWhile(n => n >= 0)` stops skipping at the first
negative and yields it, so a `Skip(1)` after it drops that one too. Check what
your version does when there is no negative at all before you run the test.
