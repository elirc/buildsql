## Hint 1

Cast a vote and watch the two numbers disagree. The counts went up and the
total did not, because they are two separate copies of the same fact and only
one of them was updated.

## Hint 2

You could patch the `voted` case to keep the total in step — and then you would
have to remember it in every future action too. The better fix is to stop
storing it: a total is something you can add up during render, where it cannot
be out of date.

## Hint 3

The reducer is then only about counts, which also simplifies `reset`. Watch the
wording of the live region: one vote is a vote, not votes.
