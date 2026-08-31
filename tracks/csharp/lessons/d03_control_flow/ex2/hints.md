## Hint 1

Both methods are one switch *expression* - `input switch { ... }` - not a
switch statement. Two pattern forms carry the whole exercise:

- `12 or 1 or 2` - an or-pattern over constants;
- `>= 3 and <= 5`, or just `< 5` - relational patterns.

Arms are tried in order, so ordering them from most specific to least removes
most of the boundary arithmetic.

## Hint 2

For `Ticket`, put the guard first and then let the ordering do the work:

```csharp
age switch
{
    < 0 => throw new ArgumentOutOfRangeException(nameof(age), "..."),
    < 5 => "free",
    < 18 => "child",
    ...
}
```

Each arm only has to name its upper bound, because everything below it was
already matched. Writing `>= 5 and < 18` is correct and says the same thing
twice.

A switch expression must be exhaustive: leave out the `_` arm and the compiler
warns, and at run time a value that matches nothing throws
`SwitchExpressionException`. Throwing your own exception from the `_` arm is
how you turn that into a message the caller can act on.
