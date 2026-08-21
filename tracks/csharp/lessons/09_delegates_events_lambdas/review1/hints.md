## Hint 1

Two methods, both returning functions, both from ex2 and ex4's playbook.

`MakeAdder` keeps a running total in a captured local — the counter from ex2,
with an argument. `Not` wraps a predicate you were handed and flips its answer.

## Hint 2

The adder's lambda needs a body with two statements, so it takes braces:

```csharp
int total = 0;
return amount =>
{
    total += amount;
    return total;
};
```

`Not` is a single expression: `value => !predicate(value)`.

## Hint 3

The gate checks that a second adder starts from zero. If yours does not, the
state is in the wrong place — a `static` field is shared by everything, while a
local captured by the lambda belongs to that one call of `MakeAdder`. Each call
creates a fresh closure, which is the whole difference.

It also checks that the predicate you were given still works afterwards. `Not`
returns a NEW function; it cannot and must not modify the original, because a
`Func<T, bool>` is a value, not an object with settings.

Left to you: whether `Not` should be an extension method
(`predicate.Not()`), which is how LINQ-style fluent APIs are built. The
signature would barely change and the call site would read very differently.
