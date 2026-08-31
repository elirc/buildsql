## Hint 1

The mirror of ex1: there, one rejection ended it and the successes were
counted; here one success ends it and the *rejections* are counted.

So `resolve` goes straight through as the first argument to every `.then`, and
the second argument does the bookkeeping.

## Hint 2

`AggregateError` is a real built-in: `new AggregateError(errors, message)`, with
the array readable afterwards as `.errors`. Collect the reasons **by index**
rather than pushing, or the array ends up in completion order and a caller
trying to work out which source failed has to guess.

## Hint 3

The empty case rejects rather than hanging, and the reasoning is worth having
ready: `any` resolves on the first success, and with no inputs there can never
be one — so the outcome is already decided, and it is failure. Compare with
`race([])`, which stays pending forever because nothing has *happened*.

Two rules, two different answers to the same-looking question, and being able to
explain the difference is what the interviewer is listening for.
