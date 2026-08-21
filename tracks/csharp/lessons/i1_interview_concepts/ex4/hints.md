## Hint 1

Both methods are one or two lines. Both are about the same word: `await`.

`LoadAsync` must not block and must not wrap the exception. `RecordAsync` must
wait for the work before it logs, and must let a failure reach whoever is
awaiting it.

## Hint 2

```csharp
public static async Task<int> LoadAsync(Task<int> work)
{
    return await work;
}
```

```csharp
public static async Task RecordAsync(Task work, List<string> log)
{
    await work;
    log.Add("done");
}
```

That is genuinely all. The exercise is knowing what the *wrong* versions were:
`return work.Result;` and `async void`.

## Hint 3

Be able to say both failure modes out loud, because both get asked:

- **`.Result`** blocks the calling thread until the task finishes, and rethrows
  any failure wrapped in an `AggregateException`. Under a synchronization
  context (WPF, WinForms, old ASP.NET) the continuation needs the very thread
  you are blocking, and the whole thing deadlocks.
- **`async void`** returns nothing to await, so the caller cannot wait for it,
  cannot know when it finished, and cannot catch its exception — which is
  raised on the synchronization context and usually kills the process. The only
  legitimate use is an event handler.

Left to you: the gate checks that `"done"` is *not* logged when the work fails.
Work out which line of your implementation guarantees that, and what would have
to change for the log entry to happen anyway.
