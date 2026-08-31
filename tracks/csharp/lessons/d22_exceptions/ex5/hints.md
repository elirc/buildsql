## Hint 1

`Probe` is written for you and already logs its own open and dispose. Your job
is to make sure the dispose happens - which is what `using` is for.

`Use` also has to catch, because it returns `"failed:..."` rather than
throwing. Think about where the `catch` goes relative to the `using`.

## Hint 2

```csharp
using (Probe probe = new Probe(name, log))
{
    try { body(probe); return "ok"; }
    catch (Exception ex) { return $"failed:{ex.Message}"; }
}
```

The `using` compiles into a `try`/`finally`, so the dispose happens on the way
out of either `return`.

`UseTwo` stacks two of them and catches nothing:

```csharp
using (new Probe("outer", log))
using (new Probe("inner", log))
{
    body();
}
```

Predict the disposal order before you run the test. Nested usings unwind in
reverse - last opened, first closed - and that is not arbitrary: the inner
resource may need the outer one to still be alive while it shuts down.
