## Hint 1

Two separate bugs. The first is that `4` is written in the handler, so the value
an operator sets under `Dojo:D24:MaxTicketsPerVisitor` can never take effect -
the `IOptions<D24Options>` parameter is already there and unused. The second is
that the method returns as soon as one thing is wrong.

## Hint 2

Read `options.Value.MaxTicketsPerVisitor` into a local at the top. Then build a
`Dictionary<string, string[]>`, add an entry for each field that failed, and
return `TypedResults.ValidationProblem` only when the dictionary is non-empty -
passing `type: D24Problems.Base + "invalid-request"`.

Put the count message in terms of the limit you read, not the number 4. Check
the exhibit exists only after the payload is known to be good.
