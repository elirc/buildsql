## Hint 1

This is the shape people write when they *mean* a concurrency limiter and get
it wrong — and here it is what was asked for, because sometimes a batch really
is the unit of work (one bulk insert, one multi-get, one API call that takes a
hundred ids).

Outer loop stepping `size` at a time, `slice` the group, start them all, await
them all, append.

## Hint 2

`Promise.all` gives you three of the four requirements for free: it starts
nothing itself (the `map` already did), it preserves input order, and it rejects
on the first failure. Awaiting it is what stops the next group.

Two details: the worker is given its **absolute** index, not its offset within
the group — so add the group's start. And an empty input has to fall out
naturally, which it does if the loop condition is written against the length
rather than a computed batch count.

Be ready to say why this is the wrong tool when the items are independent: every
group takes as long as its slowest member, and the fast slots sit idle. That is
what ex5 is for.
