## Hint 1

Read the return type first. `ForName` returns a `Func<int, int, int>`, not an
`int` - so its body never adds anything. It picks which operation to hand back
and hands it back; the caller supplies the operands later.

`Twice` is the mirror image: it receives behaviour and is the one that calls
it.

## Hint 2

A `switch` expression whose arms are lambdas is the tidiest shape:

```csharp
return name switch
{
    "add" => (a, b) => a + b,
    // ...
    _ => throw new ArgumentException($"unknown operation: {name}", nameof(name)),
};
```

For `Twice`, write down what `Twice(x => x + 3, 10)` should produce before you
code it: 10 goes in, the transform makes 13, and 13 goes back through the same
transform. So the result feeds the second call, and `transform(x) * 2` is a
different function that happens to agree when the transform is doubling.
