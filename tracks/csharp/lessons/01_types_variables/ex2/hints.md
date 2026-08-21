## Hint 1

Three separate one-liners, three separate ideas.

`Truncate` needs the conversion that throws the fraction away rather than the
one that rounds. `RoundHalfAwayFromZero` needs the rounding call whose default
behaviour is *not* what you want, so you have to say what you do want.
`SafeAdd` needs you to notice which type the addition happens in — and it is
not the return type.

## Hint 2

An explicit cast, `(int)someDouble`, truncates toward zero. That is a language
feature, not a library call: no `Math` involved.

`Math.Round(double)` exists, and so does `Math.Round(double, MidpointRounding)`.
The second parameter is an enum; look at the values it offers. `Math.Round`
returns a `double`, so you still owe the compiler a conversion.

For `SafeAdd`: `a + b` where both are `int` is computed as an `int` and then
widened, so the overflow has already happened by the time the `long` gets it.
Widen *first*.

## Hint 3

```csharp
public static long SafeAdd(int a, int b)
{
    return (long)a + b;   // one cast, on the left operand
}
```

Casting one operand promotes the whole expression, which is why the second `b`
needs nothing. Apply the same "where does this actually happen" thinking to
the rounding: the `MidpointRounding` value you want is the one whose name says
which way a `.5` goes, and you still have to convert the `double` result to
the declared `int` return type.
