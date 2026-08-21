## Hint 1

Two separate jobs in one method, and they should stay separate: reject the
scores that are not scores, then map the ones that are onto a letter.

Do the rejecting first, at the top, and return nothing from that part — a guard
clause throws and gets out of the way.

## Hint 2

A `switch` *expression* produces a value, so it can be returned directly:

```csharp
return score switch
{
    >= 90 => "A",
    // ...
    _ => "F",
};
```

Those `>= 90` arms are *relational patterns*. Order matters: arms are tried top
to bottom, so a 95 matches the first arm that fits and never reaches the rest.
`_` is the discard pattern — the catch-all, and the compiler will tell you if
you leave it out and it cannot prove you covered everything.

## Hint 3

The guard is:

```csharp
if (score < 0 || score > 100)
{
    throw new ArgumentOutOfRangeException(nameof(score), score, "A score must be between 0 and 100.");
}
```

`nameof(score)` is a compile-time string of the parameter's name — rename the
parameter and it follows, which a string literal would not. Then write the four
bands in the order that lets each arm assume the ones above it already
failed, and let `_` handle everything below 60.
