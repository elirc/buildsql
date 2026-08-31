## Hint 1

The question is not "in what order do the queues run" — you know that from ex1.
It is "when does the nextTick queue count as empty", given that draining it adds
to it.

## Hint 2

Node drains that queue with a `while` loop, not a fixed-length pass: it keeps
taking the front entry until there is nothing left, including entries added
while it is running. Three callbacks therefore run consecutively with no gap.

That is the mechanism behind the warning you have read about `process.nextTick`
recursion, and this snippet is the smallest possible demonstration of it. The
only thing left for you to decide is where `micro` and `timer` end up relative
to that block — and whether either of them can get in between.
