## Hint 1
Copy the query in; that's the whole edit. If you're tempted to add an
index anyway - try it in the lab and time both. Measurement beats
intuition.

## Hint 2
No, really: the exercise is copying the query and reading the Hash
Join in the plan. `Hash` builds on customers (the smaller side);
`Seq Scan` streams orders through it. Both seq scans are correct here.
