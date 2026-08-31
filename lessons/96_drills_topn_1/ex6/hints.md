## Hint 1

"The second X" is the top-N idiom with the filter changed: not `rn <= 2` but `rn = 2` exactly. The interview classic "second-highest salary" is this query with different nouns.

## Hint 2

`row_number()` partitioned by category, ordered `price DESC, id ASC`, keep `rn = 2`. Note what `row_number` decides for you: if two products tie for the highest price, the runner-up by row number is the *other* tied product, not the next price level down - `dense_rank` would answer that different question.
