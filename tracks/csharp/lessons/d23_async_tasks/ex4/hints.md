## Hint 1

`DescribeAsync` is a `try`/`catch` around an `await`. Note that `await`
unwraps: the exception you catch is the original one, not the
`AggregateException` that `.Result` would have handed you.

`AllErrorsAsync` is the interesting one. Await `Task.WhenAll`, catch, and then
look somewhere other than the exception you caught.

## Hint 2

`await Task.WhenAll(...)` rethrows only the FIRST failure, deliberately -
rethrowing an aggregate would break every `catch (SomeSpecificException)` in
the world. But the task WhenAll returns has all of them, and so does each
individual task:

```csharp
Task<string>[] all = tasks.ToArray();
try { await Task.WhenAll(all); } catch (Exception) { }

return string.Join(",", all
    .Where(task => task.IsFaulted)
    .Select(task => task.Exception!.InnerException!.Message));
```

Materialise the sequence first with `ToArray`, or you will enumerate it twice
and start each task's `WhenAll` registration on a different set of objects.

`task.Exception` is always an `AggregateException`, so the message you want is
one level in.
