## Hint 1

Each method is a loop with a `yield return` inside. No lists, no early
returns - when the loop condition is false from the start, the sequence is
simply empty, which is exactly what the gate wants for `UpTo(7, 3)` and
`Repeat(_, 0)`.

## Hint 2

```csharp
for (int value = first; value <= last; value++)
{
    yield return value;
}
```

`Repeat` is the same shape counting `i` from 0 while `i < times` - a negative
`times` never enters the loop, so no guard is needed.
