## Hint 1
`DISTINCT` applies to the whole row you selected, so listing two columns
asks for distinct *pairs* - not distinct departments.

## Hint 2
Do not filter the NULL manager out. `DISTINCT` treats NULLs as equal to
each other for de-duplication purposes, so the CEO's department and a NULL
manager arrive as one ordinary row.
