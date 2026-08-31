## Hint 1

Nothing here is new - it is ex1 through ex7 in one handler. What is new is the
order, and the order is the exercise: independent field checks first, then the
cross-field rule, then the 422.

## Hint 2

One dictionary from top to bottom:

- `vetCode` - `D17Clinic.Find(...)` returning null is a 400 keyed `"vetCode"`,
  because here the vet is a field of the body, not a segment of the URL
- `owner` / `owner.name` - ex5's nesting
- `visits` and the indexed keys, duplicates included - ex4's loop
- `startHour` - ex3's range

## Hint 3

The last two checks each have a guard.

The total length rule runs only `if (errors.Count == 0)`, because a round built
from invalid visits has no meaningful duration.

The 422 runs only after the dictionary has been returned empty, because a client
with a typo should be told about the typo rather than sent to find another vet.
The reference is `$"{vet.Code}-{body.StartHour}"`, and the `Location` is
`/d17/bookings/` plus that.
