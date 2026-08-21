## Hint 1

Same two passes as ex1, but now three of the callbacks schedule *more* work
while they run. That is the whole exercise: a queue you are draining can grow
while you drain it.

Start by writing the four synchronous facts down - the two `log` calls at the
top level, and the fact that four callbacks got queued - and only then start
serving queues.

## Hint 2

Two rules decide everything here.

**The nextTick queue is drained to empty, including entries added while you
are draining it.** So a `process.nextTick` scheduled from inside a nextTick
callback runs in the same drain, before any microtask.

**The microtask queue is drained to empty the same way** - but a nextTick
scheduled from inside a *microtask* does not interrupt it. The microtasks
finish first, and then the runtime notices the nextTick queue has refilled and
drains it again. Only when both queues are empty does the timer get its turn.

## Hint 3

Order of business, once the synchronous lines are done:

1. `tick-1`, and whatever it queued, until the nextTick queue is empty;
2. the microtasks that were queued during the synchronous pass, in the order
   they were queued, plus any microtask they queue while running;
3. back to the nextTick queue if anything landed in it during step 2;
4. the timer.

Nine lines in total. The decision left to you is what happens *inside* step 2,
where one callback logs, schedules a nextTick and schedules another microtask,
and a second microtask was already waiting behind it.
