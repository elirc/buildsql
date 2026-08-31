## Hint 1

Both functions are the same recursive step: handle one item, then schedule
yourself again for the next one, and resolve when there are none left. Only the
*scheduling call* differs — which is exactly the point being made, so write the
driver once and pass the scheduler in.

## Hint 2

The two schedulers are `process.nextTick` and `setImmediate`.

`process.nextTick` puts you back in the checkpoint, and the checkpoint runs
until its queues are empty — so re-arming from inside it means the loop never
advances a phase. That is the starvation the gate detects with a `setImmediate`
probe that never gets a turn.

`setImmediate` puts you in the check phase of the loop, so everything else the
loop has queued runs before you come back.

## Hint 3

One ordering detail decides the last assertion. The gate expects the probe to
land in the *middle* of the fair run, not at the front — so the first item has
to be handled before you first yield.

That falls out naturally if your step function handles an item and *then*
schedules the next, and it does not if you schedule first and handle later.
`await` nothing at the top; call `step()` directly.
