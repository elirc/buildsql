## Hint 1

No `setTimeout` appears anywhere in this answer. "Time" is a number you own, and
`advanceTo` is a loop over a list — which is exactly how the fake timers the
other problems run under are built.

Each entry needs its scheduled time, its callback, and one more field: a
sequence number, because two entries due at the same instant have to keep the
order they were added in and array position will not survive the removals.

## Hint 2

The tempting shape is "sort the list, then walk it". It breaks on the last
requirement: a callback that schedules more work can add an entry that is *also*
due inside the window you are advancing through, and a pre-computed list cannot
see it.

Loop instead: find the earliest due entry, remove it, run it, repeat until
nothing is due. Removing before running is what stops a callback that
reschedules itself from being run twice in the same pass.

## Hint 3

Set `current` to the target time *before* running anything, so a callback that
calls `now()` sees the time it was scheduled for rather than the time it was
scheduled at. That is what the real timers do, near enough.

The guard is one comparison at the top. The remaining decision is whether
`advanceTo(current)` — the same time again — should be legal; the gate does not
force your hand, so pick a rule and make the code state it.
