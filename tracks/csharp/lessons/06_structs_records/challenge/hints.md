## Hint 1

`Classify` is one `switch` expression with seven arms, and the whole exercise is
their **order**. Three of your arms would happily match `(0, 0)`; only one of
them should get the chance.

`Mirror` is two lines: take the point apart, put a new one together the other
way round.

## Hint 2

Because `Point` is a record struct, it has a generated `Deconstruct`, which
unlocks *positional patterns* — you can match on the parts directly:

```csharp
point switch
{
    (0, 0) => "origin",
    (_, 0) => "on the x axis",
    // ...
}
```

`_` inside a positional pattern means "anything here". Relational patterns work
in the same position: `( > 0, > 0)` is the top-right quadrant.

Deconstruction also works in a declaration: `var (x, y) = point;`.

## Hint 3

Quadrants count anticlockwise from the top right: 1 is (+, +), 2 is (-, +), 3 is
(-, -), 4 is (+, -).

Once the origin and the two axis cases are out of the way, neither coordinate
can be zero, so three relational arms plus a `_` catch-all cover the rest — and
the compiler needs that `_` to prove the switch is exhaustive.

Decision left to you: whether to write the fourth quadrant explicitly as
`( > 0, < 0)` and add a `_` arm that throws. Being explicit and letting the
catch-all be unreachable-but-required is defensible; so is letting `_` be the
fourth quadrant. One of them survives someone adding a third dimension better
than the other.
