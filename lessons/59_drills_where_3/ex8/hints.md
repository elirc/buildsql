## Hint 1
Two underscores, not a `%`. The whole point of the cohort is that the id
is two digits long.

## Hint 2
The country exclusion is `NOT IN` (or its De Morgan twin, `<> 'US' AND <>
'GB'`). Writing it as `<> 'US' OR <> 'GB'` returns every customer, since no
country can be both.

## Hint 3
Build it in two steps and check each: run the pattern alone and confirm
the ids you get are all two-digit; then add the country exclusion and
confirm the count only goes down. If adding a filter makes a result grow,
an `OR` has escaped its brackets.
