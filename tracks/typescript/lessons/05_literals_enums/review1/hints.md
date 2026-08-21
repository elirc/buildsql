## Hint 1

Three verdicts, three icons, and a type that currently accepts every string in
the world. Same move as ex1: replace `string` with the union of the three
literals the README lists.

## Hint 2

Once `Verdict` is a literal union, a `switch` over it narrows in each branch
and a typo in a `case` label becomes a compile error rather than a branch that
never runs. That second property is worth more than it sounds: a mistyped
string comparison is invisible in review and silent at runtime.

## Hint 3

`type Verdict = "pass" | "fail" | "skip"`, then a `switch` returning `"ok"`,
`"x"` and `"-"`.

Left to you: whether to return a `string` or to give the function a literal
return type of `"ok" | "x" | "-"`. The gate accepts either. Which one would you
want if a caller had to `switch` on the result?
