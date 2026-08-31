## Hint 1

Write out the microtask queue as an actual list and process it one entry at a
time, appending to the end as callbacks queue more work. Nine labels is too many
to hold in your head, and the whole skill being drilled is the bookkeeping.

Start by filling in the queue as it stands the moment the synchronous code
finishes. Three of the four initial entries come from the three schedulers in
the snippet; the fourth comes from the `await`.

## Hint 2

The rule that makes this snippet interesting: `.then(a).then(b)` queues only
`a`. `b` is queued when `a` returns, because that is when the promise `b` is
attached to settles.

So the chain is not three consecutive microtasks — it is one, then a gap, then
one, then a gap. Whatever was already waiting fills the gaps.

## Hint 3

`await Promise.resolve()` behaves the same way: the code after it is queued as
one microtask, at the moment the await is reached — so it goes to the *back* of
the queue, behind everything queued during the synchronous run.

You now have every rule you need. The only judgement left is where `a-2` lands
relative to `p2` and `p3`, and that is decided purely by the order you appended
things in step 1. Trust the list.
