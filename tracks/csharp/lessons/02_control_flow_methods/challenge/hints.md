## Hint 1

Two methods, and the second one should call the first. If you find yourself
writing the sequence logic twice, stop and reuse.

`Steps` is a loop whose trip count you cannot know in advance — nobody can, in
general; that is what makes the Collatz conjecture a conjecture. That rules out
`for` as the natural shape.

## Hint 2

```csharp
long current = start;
int count = 0;
while (current != 1)
{
    // even -> halve it; odd -> 3n + 1
    count++;
}
return count;
```

Test for even with `current % 2 == 0`. Use `long` for the running value: the
sequence climbs a long way above its starting point (27 reaches 9232), and
using a wider type for an intermediate is the ex2 habit from lesson 01.

`LongestUnder` is a `for` over `1..limit-1` keeping the best-so-far, exactly
like the running maximum in ex2.

## Hint 3

The tie-break rule decides one character. Keeping the best with
`if (count > bestSteps)` keeps the *first* winner; `>=` would keep the last.
The prompt says the smaller starting number wins.

Remember `steps` is an `out` parameter, so it must be assigned on every path
that returns — assigning it once at the end, from the best you tracked, is
enough here. And do not print anything: the gate reads your return values, not
your console.
