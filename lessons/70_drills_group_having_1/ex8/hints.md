## Hint 1

The condition is about a property of the whole group - how many different months it spans - so it cannot be expressed as a row filter at all.

## Hint 2

`HAVING` may contain any aggregate, including `count(DISTINCT <expression>)`, and it must be written out in full there even though the same expression already has an alias in the SELECT list.
