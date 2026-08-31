## Hint 1

Two steps in one expression: extract the path as text (lesson 19), then cut the number out of /p/1234 (lesson 04's string functions) and cast it.

## Hint 2

Splitting /p/1234 on the slash gives fields of empty, p, and 1234 - so split_part(payload ->> 'path', '/', 3) is the number, as text. Cast it with ::int or the column comes back as text.
