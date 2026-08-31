## Hint 1

The requirement holds the data and the handler holds the logic. Read the
caller's grade with `D21Claims.GradeOf(context.User)` and compare it against
`requirement.Grade` - not against a 5 written in the handler, or the same
handler cannot serve a second policy.

## Hint 2

    if (D21Claims.GradeOf(context.User) >= requirement.Grade)
        context.Succeed(requirement);

...and nothing in the `else`. Not succeeding already means "this is not a
reason to allow it"; calling `Fail` would mean "nobody may allow it", which is a
much stronger claim and belongs in ex7.

`GradeOf` returns 0 when there is no grade claim, so the missing-claim case
needs no special handling. And the bound is inclusive: exactly 5 passes.
