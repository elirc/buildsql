## Hint 1

"Is a manager" is not a column - it is a semi-join against the same table (lesson 10 meets lesson 13): someone whose id appears in another row's manager_id. The two averages are conditional aggregates over that test.

## Hint 2

avg(salary) FILTER (WHERE EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = s.id)) for managers; NOT EXISTS for the rest. A department with nobody on one side returns NULL for that column - the average of nothing - which is honest and expected.
