## Hint 1

Write the invariant down first: **`AvailableCount` always equals the number of
false entries in the array.** Every method then has one job - keep that true.

The consequence is that the counter may only move on the paths where the array
actually changed. A `Reserve` that decrements before checking whether the seat
was already taken breaks the invariant on the second call.

The other half is turning a (row, seat) pair into one index.

## Hint 2

A single `bool[]` of `rows * seatsPerRow` is enough; the mapping is

```csharp
(row - 1) * SeatsPerRow + (seat - 1)
```

for 1-based rows and seats. Multiply by the row LENGTH, not by the row count -
the gate's `Reserve(2, 3)` then `IsReserved(1, 3)` pair exists to catch that.

Put the bounds checks in one private helper that returns the index, and call it
from all three public methods. Validation written three times is validation
that will disagree with itself eventually.

Structure each mutator as: compute index (which validates), check the current
state, return false if nothing to do, otherwise change the array *and* the
counter together. Two lines that must always run together are a good candidate
for sitting next to each other with nothing in between.
