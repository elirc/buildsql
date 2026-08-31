## Hint 1

A `?:` inside a projection is not C# running over loaded rows - the provider
turns it into a SQL `CASE WHEN`. So the status can be decided in the same
statement that reads the row, and the seat counts never have to travel.

## Hint 2

Nest the two conditions, severest first, in the fourth constructor argument:
sold-out (`s.Sold >= s.Seats`), else filling (`s.Sold * 10 >= s.Seats * 8`),
else open. Keep it in integers - a cast to `double` invites a rounding
argument the gate will win.
