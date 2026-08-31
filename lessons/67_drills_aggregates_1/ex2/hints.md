## Hint 1

Two different questions about the same rows: how many rows, and how many different values of one column appear in them.

## Hint 2

`count(DISTINCT product_id)` does the second. It is noticeably more expensive than a plain count, because duplicates have to be recognised - which is a Part 5 conversation, not a correctness one.
