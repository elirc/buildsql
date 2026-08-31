## Hint 1

Delete everything that is not a letter or a space - so the character class
is a negated one, and the replacement is the empty string.

## Hint 2

`regexp_replace(name, '[^A-Za-z ]', '', 'g')`. The `'g'` flag is the whole
exercise: without it only the first punctuation character is removed, which
looks like it worked on most rows.
