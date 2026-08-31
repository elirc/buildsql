## Hint 1

Start from the limiter you already know: a shared cursor and `limit` runners
that each take the next index, do the work, and come back for another. The retry
is not a new mechanism — it is a loop **inside** the runner, before it goes back
for the next index.

## Hint 2

That placement is the whole exercise. Put the retry inside the slot and a
retrying item costs you one worker, exactly as it did on its first attempt. Push
the item back onto the queue instead and a burst of failures can have `limit +
retries` calls in flight against a service that is already unwell.

Attempt numbering: the first call is attempt 1 and is not a retry, so `retries:
2` means three calls and two sleeps — never a sleep after the last failure.

## Hint 3

Fail-fast needs a flag the runners can see: set it when an item exhausts its
attempts, check it at the top of the loop, and the other runners finish what
they are holding and stop taking new work. `Promise.all` over the runners then
rejects with the error that set the flag.

The decision the gate leaves you: whether an item that fails *after* the flag is
set should still be retried. The reference does not bother — there is nobody
left to want the answer.
