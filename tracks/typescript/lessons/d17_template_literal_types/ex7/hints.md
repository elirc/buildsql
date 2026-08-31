## Hint 1

Match on the first underscore: `` `${infer Head}_${infer Tail}` ``. The
underscore is part of the pattern, so it is gone from both captures.

## Hint 2

The tail may contain more underscores, so recurse on it *before* capitalising -
capitalising first would only fix the first character of a string that still
needs converting.

Left to you: `Capitalize<SnakeToCamel<Tail>>` or `SnakeToCamel<Capitalize<Tail>>`.
Only one of them handles `"user_first_name"`; work out which by hand and then
check.
