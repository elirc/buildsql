## Hint 1
The same index as ex1 serves the WHERE; the ORDER BY rank happens on
the matches only. Nothing new to invent.

## Hint 2
Copy your ex1 index into ex2/indexes.sql. If the plan still seq-scans,
compare your index expression to the query character by character.
