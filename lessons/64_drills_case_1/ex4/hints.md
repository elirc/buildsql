## Hint 1
Evaluation stops at the first true branch, so the second `WHEN` already
knows the first was false. You do not need to write the upper bound.

## Hint 2
Put the branches in the order the prompt gives them. If you test
`> 60000` first, nobody can ever reach `senior` - the query still runs and
everybody senior is labelled `mid`.
