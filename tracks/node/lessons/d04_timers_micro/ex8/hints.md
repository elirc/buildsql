## Hint 1

Store deadlines, not delays. Convert `delayMs` to an absolute `now() + delayMs`
the moment the entry is created, and every later comparison is a plain number
comparison — no arithmetic about how much of a delay has already elapsed.

The invariant to hold on to: **one timer, aimed at the earliest deadline**.
Every operation that could change which deadline is earliest ends with the same
`rearm()` call — enqueue, cancel, and the firing itself.

## Hint 2

`rearm()` is: clear whatever is armed, and if anything is left, arm one timer
for `earliest.at - now()`, clamped at zero. Writing it once and calling it from
three places is what keeps the invariant true; inlining it three times is how
one of the three drifts.

When the timer fires, more than one entry may be due — the gate advances 200ms
over two deadlines on purpose. Collect everything due, sort it by deadline then
insertion order, and run the batch.

## Hint 3

Remove the due entries from the queue **before** running any of them. A callback
is allowed to enqueue more work, and if you splice while iterating over the live
array you will either skip an entry or run one twice.

Two decisions are left to you. What `size()` counts while a batch is running,
and whether `cancel` on an entry that already ran should re-arm — the gate calls
a cancel twice, so whatever you decide has to be idempotent.
