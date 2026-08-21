## Hint 1

This is ex1 and ex3 in one small class: a constructor that initialises instance
state, a static counter shared by the type, a read-only-from-outside property,
and one guard clause.

Write the constructor first and ask yourself which of the two counters it
touches. The answer is both — one it increments, one it sets.

## Hint 2

`Team` is `{ get; }`, assignable only in the constructor. `Points` has a
`private set`, so `Add` may change it and nobody outside may.

The guard rejects negatives only: zero points is a legal, boring award and must
not throw. Read the gate if you are unsure which side of the line zero is on.

## Hint 3

```csharp
public Scoreboard(string team)
{
    Team = team;
    Created++;      // the shared one
}
```

`Reset` sets the static counter back to 0 and does nothing else — it has no
`this` to reach any particular scoreboard's `Points`, which is the ex3 point
coming back around.

One decision left to you: whether `Add` guards with `points < 0` or
`points <= 0`. The gate's message about zero is the tiebreaker.
