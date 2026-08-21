## Hint 1

The two constraints in these signatures are not decoration: each one unlocks
exactly one thing you would otherwise be unable to write.

`where T : IComparable<T>` is what makes `a.CompareTo(b)` legal.
`where T : new()` is what makes `new T()` legal. Delete either constraint and
read the compiler error — it is a good way to feel what constraints are for.

## Hint 2

`Max` is the running-maximum loop from lesson 02, with `CompareTo` in place of
`>`. `item.CompareTo(best) > 0` means "item sorts after best".

The seeding question is the one that bites: you cannot start `best` at 0, and
`default(T)` is null for a class and 0 for an int — both wrong. Track a
`bool seenAny` and take the first item you see, or split the sequence's first
element out before the loop.

`Fill` is a `for` loop adding `new T()` to a list.

## Hint 3

```csharp
bool seenAny = false;
T best = default!;
foreach (T item in items)
{
    if (!seenAny || item.CompareTo(best) > 0)
    {
        best = item;
        seenAny = true;
    }
}
```

The `!` in `default!` tells the compiler "I know this looks null-unfriendly, I
have it covered" — the null-forgiving operator. Without it, a nullable-reference
warning appears, and the warning is not wrong: the value is only safe because
`seenAny` guards every read of it.

Then throw `InvalidOperationException` when nothing was seen. Left to you: what
message to put in it. Say what was empty and what was being asked.
