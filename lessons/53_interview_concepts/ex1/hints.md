## Hint 1
Read the failing query out loud with a NULL substituted in: "is 7 not equal
to 3, and not equal to 12, and not equal to *unknown*?" What is the truth
value of that whole AND-chain, and does `WHERE` keep it?

## Hint 2
Two legal fixes. Either stop the NULL reaching the list --
`... FROM staff WHERE manager_id IS NOT NULL` -- or drop `NOT IN` entirely
and ask the question directly with `NOT EXISTS (SELECT 1 FROM staff m
WHERE m.manager_id = s.id)`.

## Hint 3
`NOT EXISTS` is what an interviewer wants to hear, because it needs no
NULL-handling at all: it asks "does a row exist where m.manager_id = s.id?"
and a NULL `manager_id` simply never matches. Correlate the inner query on
`s.id`, select the three columns, and you are done.
