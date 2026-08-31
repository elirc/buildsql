## Hint 1

Same pair of operators as ex4, on an object instead of an array. `as const`
first so the keys and the nested literals survive, then `satisfies` so a plan
with a missing `seats` is caught here rather than at the first call site.

## Hint 2

Check the `satisfies` target against what `as const` produced: the nested
`features` arrays are now readonly tuples, so the target has to say
`readonly string[]` rather than `string[]`.

## Hint 3

Read `Feature` slowly: index the table by *every* plan name at once, take the
`features` member of the result, then index that with `[number]`. Each step
produces a union, and the last one flattens three tuples into one union of
strings.

Left to you: whether `Feature` should be defined that way or as
`(typeof PLANS)[PlanName]["features"][number]` written in stages with a helper
type. The one-liner is shorter; the staged version is the one you can debug.
