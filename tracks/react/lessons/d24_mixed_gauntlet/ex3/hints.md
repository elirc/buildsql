## Hint 1

The button already records that something happened — and the effect's empty
dependency array means the countdown never hears about it. React runs the
previous cleanup before re-running an effect, so a dependency that changes on
every activity is exactly "cancel the old timer and start a new one".

## Hint 2

Once it has gone idle there is nothing left to count, and saying so in the
effect is what leaves no timer running at the end. That means the idle flag is
a dependency too.

## Hint 3

The last piece: the parent may hand over a different `onIdle` between one
activity and the next, and the timer that eventually fires has to call the
current one. Listing it in the array would restart the countdown on every
render — a ref updated by its own effect will not.
