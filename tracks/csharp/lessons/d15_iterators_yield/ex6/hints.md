## Hint 1

You need both sequences open at once, each advanced at its own pace - that
means `first.GetEnumerator()` and `second.GetEnumerator()` held in locals
(wrap each in a `using` declaration), with `MoveNext()` telling you whether
a `Current` is available. Track each side's has-an-item flag in a bool.

## Hint 2

```csharp
using IEnumerator<string> a = first.GetEnumerator();
using IEnumerator<string> b = second.GetEnumerator();
bool hasA = a.MoveNext();
bool hasB = b.MoveNext();
while (hasA || hasB)
{
    if (hasA) { yield return a.Current; hasA = a.MoveNext(); }
    if (hasB) { yield return b.Current; hasB = b.MoveNext(); }
}
```

`MoveNext` advances - it never peeks - so call it exactly once per item you
consume.
