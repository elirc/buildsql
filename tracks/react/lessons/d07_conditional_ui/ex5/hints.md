## Hint 1
Three answers, in a fixed order of priority: not signed in beats not entitled,
and not entitled beats showing the content. Guard clauses express a priority
order; a chain of `&&` does not.

## Hint 2
Each guard returns immediately, so by the time you reach the last line both
questions are settled and the only thing left to do is render `children`. Note
what that means for the failing cases: the children are never created at all,
which is the difference between a gate and a coat of paint.
