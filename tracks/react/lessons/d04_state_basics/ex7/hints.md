## Hint 1
Two separate bugs live in the stub. The first is arithmetic: three callbacks
created during the same render all remember the same `count`, so they all
compute the same answer. The second is ownership: nobody is holding on to the
timers, so nothing can call them off.

## Hint 2
`setCount(current => current + 1)` asks React for the value at the moment the
update is applied rather than the value from the render that scheduled it. That
alone fixes the count.

## Hint 3
For Reset you need the timer ids to survive re-renders without causing them,
which is what a ref is for. Keep the ids you have not cancelled yet, clear them
all in Reset, and decide what the list should look like afterwards so a later
Reset does not try to cancel timers that already fired.
