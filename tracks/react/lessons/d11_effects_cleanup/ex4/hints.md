## Hint 1
Pausing is not a special case in the component - it is the ordinary case of an
effect whose dependency changed. The effect that owns the interval already
re-runs when `running` changes; the question is what it leaves behind when it
does.

## Hint 2
An effect may return early, and returning early means no cleanup is registered
for that run - which is exactly right for the paused case, because the previous
run-s cleanup has already fired by then.

## Hint 3
Finishing is a second, separate concern: something has to notice that the
counter reached zero, stop the countdown and call `onDone` once. Whether that
lives in another effect or somewhere else is your call, but keep it out of the
updater function - updaters must stay pure.
