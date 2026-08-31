## Hint 1
For each person you need a count of other people who satisfy a condition relative to **that** person. A self-join whose `ON` clause is an inequality rather than an equality does exactly this.

## Hint 2
`LEFT JOIN staff t ON t.department = s.department AND t.salary > s.salary`, then group by `s.id`. The join must be outer and the count must be `count(t.id)`, or the best-paid person in the department - the one whose answer is 0 - disappears from the report.
