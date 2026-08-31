## Hint 1

An infinite iterator is legal and safe: `while (true)` around a `foreach`
(for `Cycle`), or a `for` loop with no end condition (for `From`). The
caller's `Take`/`First` decides when to stop pulling - the body only runs
one slice per pull.

## Hint 2

The one guard that matters: `Cycle` of an EMPTY list must yield nothing, not
loop forever finding nothing to yield. Check `items.Count == 0` and
`yield break` BEFORE the `while (true)`. `From` is:

```csharp
for (int value = start; ; value++) { yield return value; }
```
