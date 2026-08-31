## Hint 1
Three shapes and one fallback: nobody, exactly one, and two or more. Write
them down as cases before you write any string handling - the code is short
once the cases are named.

## Hint 2
For two or more, the last name is special and everything before it is joined
with commas. `slice(0, -1)` gives you the everything-before part, and
`names[names.length - 1]` the last one.
