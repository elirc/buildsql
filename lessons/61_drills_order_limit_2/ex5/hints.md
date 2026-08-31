## Hint 1
Filter first, then sort, then limit - which is also the order the clauses
appear in the query.

## Hint 2
The `LIMIT` applies to the filtered rows, not to the table: you get the
ten newest cancellations, not the cancellations among the ten newest orders.
Those are different questions and only one of them is asked here.
