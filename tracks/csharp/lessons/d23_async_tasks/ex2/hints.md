## Hint 1

`TraceAsync` is the straightforward async method - log, await, log, return.
Predict what the gate will see before you write it: is `"before"` in the log
while the returned task is still pending?

`GreetAsync` is the one that needs a trick, and the summary says why: the
exception must arrive at the *call*, not in the returned task.

## Hint 2

An `async` method never throws at its caller. Everything, including an
exception before the first `await`, goes into the returned task. So the
validation has to live in a method that is not `async`:

```csharp
public static Task<string> GreetAsync(string name, Task ready)
{
    if (string.IsNullOrEmpty(name)) { throw new ArgumentException(...); }

    return Greet();

    async Task<string> Greet()
    {
        await ready;
        return $"hello {name}";
    }
}
```

A local function keeps the two halves together. This is the standard shape for
argument validation in the task-based pattern, and it is the same problem
iterator methods have with `yield`.
