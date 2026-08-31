## Hint 1

Three things are missing. `push` edits the array the caller still owns; a seat
that is already chosen should be given up rather than added twice; and the
booking has a capacity that nothing currently checks.

## Hint 2

`filter` and a spread both build new arrays, which is what you want here.
Decide the three cases in the order that reads naturally: already chosen, at
capacity, otherwise add.

## Hint 3

Two of the gate's checks use `toBe`, not `toEqual` — a refused seat and a clear
of an already-empty booking both have to hand back the exact object they were
given, because nothing about the booking changed.
