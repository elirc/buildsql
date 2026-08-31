## Hint 1

Two pieces of state: a tally from value to vote count, and how many inputs have
not settled yet. A `Map` compares its keys the way `Object.is` does, which is
exactly the comparison asked for.

Every fulfilment increments its value's count and checks it against the quorum;
every settlement of either kind decrements the undecided count.

## Hint 2

The hard half is knowing when to give up. "Everything has settled and nothing
reached the quorum" is one case, and it is not the only one — the gate has a
run with two voters, a quorum of two, one rejection and one input that never
settles at all.

So ask the forward-looking question after every settlement: **could any value
still reach the quorum?**

## Hint 3

Formally: take the current leader's count, add the number of votes still to be
cast, and compare with the quorum. If even the best case falls short, reject
now.

That single expression covers all three failure shapes — everything settled and
nobody won, a rejection that makes the arithmetic hopeless, and an empty input
list where the leader is 0 and there are no votes left. Which is why the empty
case needs no branch of its own beyond running the check once.

The remaining decision is what to do about the inputs that are still pending
when you settle. Nothing in this exercise stops them, and a real quorum read
would want an `AbortSignal` so the losers can be called off.
