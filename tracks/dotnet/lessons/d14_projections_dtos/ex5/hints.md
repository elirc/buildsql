## Hint 1

Every film appears, so nothing is filtered - the work happens inside the
projection. A correlated `OrderBy(...).FirstOrDefault()` over the film's
screenings is translated and runs once per film inside the one statement.

## Hint 2

Two subqueries, one for the day and one for the room, both ordered
`.OrderBy(s => s.Day).ThenBy(s => s.Id)` so the tie is deterministic.

## Hint 3

`FirstOrDefault()` over an empty sequence gives you the CLR default: `0` and
`""`, not `null`. Project the element as nullable first -
`.Select(s => (int?)s.Day).FirstOrDefault()` and
`.Select(s => (string?)s.Room).FirstOrDefault()` - so a film with no
screenings really reports null.
