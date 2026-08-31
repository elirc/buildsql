## Hint 1

Two things must BOTH hold, so this one is an AND - which is what a policy is by
default. No handler is needed: a rule that depends only on the caller's own
claims is a `RequireClaim` and a one-line assertion.

## Hint 2

    .RequireClaim(D21Claims.Ward)
    .RequireAssertion(context => D21Claims.GradeOf(context.User) >= 5)

Reaching for `IAuthorizationRequirement` when a lambda will do is how a policy
file stops being readable.

## Hint 3

In the handler, `NewShift.Ward` is never read. The policy has just insisted the
caller has a ward claim; that claim is the ward, exactly as the subject is the
doctor. Validate the day first (`ValidationProblem` keyed `"day"`), then
`roster.Add(...)`, then `TypedResults.Created($"/d21/shifts/{shift.Id}", ...)`.
