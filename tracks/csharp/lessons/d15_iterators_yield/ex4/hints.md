## Hint 1

One `foreach`, and a local that remembers the PREVIOUS item. Skip the yield
on the very first item (nothing to pair with yet); from then on, yield the
pair and update the local. Anything built from `Skip(1)` or `Zip` enumerates
the source twice, and the gate counts walks.

## Hint 2

```csharp
bool first = true;
int previous = 0;
foreach (int value in values)
{
    if (!first) { yield return (previous, value); }
    previous = value;
    first = false;
}
```

`Deltas` is the identical skeleton yielding `value - previous`.
