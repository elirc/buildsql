## Hint 1

Both methods are one line, and the difference is one call. Look at the return
types: one hands back an `IEnumerable<int>` and the other a `List<int>`.

A `Where` on its own has not read anything yet.

## Hint 2

```csharp
numbers.Where(number => number >= min);            // a query
numbers.Where(number => number >= min).ToList();   // an answer
```

The query object holds a reference to the *list*, not to its contents, and runs
the whole chain again from the beginning each time somebody enumerates it -
which is why the item added afterwards appears.

Worth taking as a rule: a method that returns a result should return a
`List<T>` or an array, and a method that returns a query should have a name
that says so. Returning a deferred query from something called `GetActiveUsers`
is how a caller ends up running it three times.
