## Hint 1

Both bodies are one line of arithmetic. The exercise is not the maths — it is
noticing that `Shape` deliberately has no formula, and that the `override`
keyword on each subclass is a promise to supply one.

If you are unsure what `abstract` bought you, try deleting one of the two
`Area` overrides and reading the compiler error.

## Hint 2

A rectangle's area is width times height; both are already properties on the
class.

A circle's is pi r². Use `Math.PI` rather than typing 3.14159 — the constant is
a `double` with full precision, and the gate rounds to four decimal places
expecting exactly that.

There is no `Math.Square`; `Radius * Radius` is idiomatic, and `Math.Pow(r, 2)`
is slower and less readable for a square.

## Hint 3

```csharp
public override double Area()
{
    return Width * Height;
}
```

The circle is the same shape of method with a different expression. Neither
subclass needs a field, a constructor change, or a call to `base` — everything
they need is already stored.

One thing to notice before you move on: the gate declares its variables as
`Shape`, not as `Rectangle`. Your code is being called through the base type,
and it works anyway. That is the payoff the next three exercises build on.
