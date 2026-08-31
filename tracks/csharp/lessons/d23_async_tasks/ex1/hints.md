## Hint 1

Write out the two obvious versions of `BothAsync` and compare them:

```csharp
return $"{await first()}+{await second()}";      // one after the other
```

In that version, when is `second()` even called? Not until the first task has
finished. The gate records the moment each factory runs, so it can tell.

## Hint 2

Call both, then await both:

```csharp
Task<string> firstTask = first();
Task<string> secondTask = second();
return $"{await firstTask}+{await secondTask}";
```

A method that returns a `Task` has already started its work by the time you
hold the task, so both operations are in flight before either await. The order
you await them in does not change the answer - the output order comes from the
parameters.

For the other two, `Task.FromResult(value)` and
`Task.FromException<string>(new InvalidOperationException(message))` build
finished tasks with no async machinery at all. Note the second one *returns*
the failure rather than throwing it, which is what a caller holding a `Task`
expects.
