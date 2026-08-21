## Hint 1

`TryMinMax` returns a `bool` *and* produces two values. That is what `out` is
for, and the compiler enforces the contract: every path that returns must have
assigned both out parameters first. Try returning early without assigning them
and read the error — it is one of the clearest messages the C# compiler emits.

`Sum` has a `params` array. Inside the method it is an ordinary `int[]`; the
keyword only changes what callers may write.

## Hint 2

Assign both out parameters at the very top of the method, before any branch.
Then the empty-array early return costs you nothing and no path can be missed.

For the running minimum and maximum, seed them from `values[0]` rather than
from `0` — an array of all-positive numbers would otherwise report a minimum of
0, which is not in the array at all.

```csharp
min = 0;
max = 0;
if (values.Length == 0) { return false; }
min = values[0];
```

## Hint 3

The loop is one `foreach` with two `if`s inside it, comparing each value
against the current `min` and `max`. Both `if`s look at the same element, so
they belong in one pass, not two.

`Sum` is a `foreach` over `numbers` adding into a local total that starts at 0.
An empty `params` array arrives as a zero-length array, never null, so no guard
is needed — check that claim by reading what the gate expects from `Sum()`.
