## Hint 1

Two bigints divided by each other truncate. Cast the numerator with `::numeric` and the division becomes exact enough to round.

## Hint 2

The revenue ratio does not need a cast, because `sum(total)` is already numeric - but adding one changes nothing, so writing it is harmless.
