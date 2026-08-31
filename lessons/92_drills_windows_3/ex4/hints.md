## Hint 1

Write both columns exactly as the prompt gives them and look at the result before trying to explain it. The two differ only by `, id`.

## Hint 2

With `ORDER BY department` alone, every row of a department is a *peer* of every other, and the default frame includes the current row's peers - so the whole department is in frame for all of them.

## Hint 3

Adding `id` makes every row's ordering value unique, so each row has no peers and the frame ends exactly at that row. Neither answer is wrong; they answer different questions.
