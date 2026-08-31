## Hint 1

LAG looks backward, LEAD looks forward. "The date of the next hire" is the following row's `hired_on`, read from the current row.

## Hint 2

`lead(hired_on) OVER (ORDER BY hired_on, id)` - and keep the `id` tie-break inside the OVER, because two engineers hired the same day would otherwise make the result depend on chance. The most recent hire's `next_hire` is NULL.
