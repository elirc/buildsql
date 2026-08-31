## Hint 1
Teammates again - same manager - but this time the pair is ordered by hire date rather than by id, so the usual `a.id < b.id` trick is not what removes the duplicates.

## Hint 2
The inequality on the dates does that work for you: `b.hired_on - a.hired_on >= 1825` can be true in only one direction, so each qualifying pair appears once and nobody is paired with themselves.

## Hint 3
Subtracting one `date` from another in Postgres gives an integer number of days, so `b.hired_on - a.hired_on` is directly comparable to 1825 and is also the value the last column wants. Do not reach for `age()` or an interval here - the prompt asks for a plain day count.
