## Hint 1
The subquery returns a whole column of salaries, and the person has to beat every single one of them.

## Hint 2
`salary > ALL (SELECT salary FROM staff WHERE department = 'engineering' AND salary < 60000)` says exactly that. Read it as "there is nobody in that list this person fails to beat", which is also how you would write it with `NOT EXISTS`.

## Hint 3
`> ALL` is very nearly `> (SELECT max(...))`, and that spelling is usually clearer - but the two disagree when the list is empty. `> ALL` of nothing is true (there is no counterexample); `> NULL` is unknown, so the `max` version returns no rows at all. Know which behaviour you want before you pick.
