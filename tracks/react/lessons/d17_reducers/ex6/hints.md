## Hint 1

The stub answers "what does this action do?" for every action. The missing
question is "may this action happen from here?" — a job that has not started
cannot be paused, and a paused job makes no progress.

## Hint 2

Draw the four statuses and the arrows between them before you write anything.
Every case then becomes: check `state.status`, and if the arrow does not exist,
return the state unchanged.

## Hint 3

Two details hide in the arrows. Progress is capped at 100 rather than allowed
to run past it, and pausing keeps the progress the job already had — only
`started`, `finished` and `reset` set a progress of their own.
