## Hint 1

The ordering has to happen **inside** each group. Sorting the whole sequence
and then taking two gives you two rows in total, not two per game.

Both methods need the same "top two players of this group" step, so write it
once as a private helper and call it from both.

## Hint 2

```csharp
private static IEnumerable<string> TopTwo(IEnumerable<Score> group)
{
    return group
        .OrderByDescending(score => score.Points)
        .ThenBy(score => score.Player, StringComparer.Ordinal)
        .Take(2)
        .Select(score => score.Player);
}
```

`Take(2)` over a group of one gives one - it never pads and never throws, so
the single-player game needs no special case.

## Hint 3

`Consistent` is group, flatten, group again. `SelectMany(group => TopTwo(group))`
turns the per-game winners into one flat sequence of player names, in which a
player who reached two podiums appears twice. Group *that* by the name itself
and keep the keys whose group has more than one member.

If you find yourself building a `Dictionary<string, int>` and incrementing, you
have written `GroupBy(x => x).Count()` the long way. Whether the long way is
clearer here is a fair question - but write the query version at least once,
because recognising this shape is what lets you read somebody else's.
