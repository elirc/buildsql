## Hint 1

Nothing needs to change inside the handler. The requirement is declarative, so
declare it - `D20Policies` already has a policy that means what you want.

## Hint 2

`.RequireAuthorization(D20Policies.Keeper)`. That one policy produces both
statuses on its own: 401 when no valid token was presented, 403 when a valid one
was and it is not in the role.

If you find yourself writing `return TypedResults.Unauthorized()` for a caller
who is not a keeper, note that `Unauthorized` is 401 - the "I know who you are
and no" status is `Forbid`.
