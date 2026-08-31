## Hint 1

By default C# arithmetic is *unchecked*: an int addition that does not fit
wraps around silently, and `int.MaxValue + 1` is `int.MinValue`. The `checked`
keyword turns that same addition into an `OverflowException`.

Clamping needs the opposite trick - a type roomy enough to notice the problem
before it happens.

## Hint 2

`checked` works as a statement block or as an expression:

```csharp
checked { return a + b; }        // or: return checked(a + b);
```

For the clamping version, widen first and compare afterwards:

```csharp
long sum = (long)a + b;
```

The cast has to be on one operand of the addition. `(long)(a + b)` adds two
ints first, so the overflow has already happened and you are widening the
wrong answer - which is exactly the case the gate checks with two `int.MaxValue`
operands.
