## Hint 1

Count the round trips the shipped loop makes against this seed, then against a
museum with two hundred exhibits. The answer is right and the cost grows with
the data - that is an N+1. Separately, `sold` is counting rows it should not:
reread the capacity rule at the top of the README.

## Hint 2

Let the database group. Two queries is the budget: one over `Exhibits` grouped
by `Gallery` counting exhibits, one over `Tickets` filtered by `!t.Cancelled`
and grouped by `t.Exhibit!.Gallery` counting tickets.

Bring both small results back, put the second into a dictionary keyed by
gallery, and zip them in memory - ordering by gallery name.
