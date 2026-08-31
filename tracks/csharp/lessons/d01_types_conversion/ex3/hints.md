## Hint 1

`int?` is `Nullable<int>`: a struct holding a value plus a flag. `HasValue`
asks the flag, `Value` reads the value (and throws when there is none), and
`??` supplies a fallback.

The trap in all three methods is the same one: `0` is a perfectly good value,
so anything that treats "is it zero?" as "is it missing?" is wrong.

## Hint 2

`SumOrNull` has to test the *inputs*, not the sum:

```csharp
if (a is null && b is null) return null;
return (a ?? 0) + (b ?? 0);
```

`AverageOfPresent` wants a plain `foreach` with a running total and a running
count, skipping anything where `HasValue` is false. Then the division: `sum`
and `count` are both `int`, so cast one of them - `sum / (double)count` - or
the mean of 1 and 2 comes back as 1.

`Describe` is one conditional. `Nullable<T>.ToString()` on an empty nullable
gives `""`, which is not the word the gate wants.
