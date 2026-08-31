## Hint 1

Every rule in the shipped handler is correct. What is wrong is that each one
returns, so only the first failure is ever reported.

## Hint 2

Declare `var errors = new Dictionary<string, string[]>();` at the top, replace
each `return TypedResults.ValidationProblem(...)` with
`errors["petName"] = [...]`, and decide once at the end:

    if (errors.Count > 0) return TypedResults.ValidationProblem(errors);

Watch the bounds while you are there - 10 and 120 are both legal, so the
comparisons are `<` and `>`, not `<=` and `>=`.
