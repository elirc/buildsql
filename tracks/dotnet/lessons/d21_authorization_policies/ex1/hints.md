## Hint 1

`RequireAuthenticatedUser()` asks whether there is a valid token. The roster's
actual rule is about the caller: they have to work on a ward.

## Hint 2

Add `.RequireClaim(D21Claims.Ward)` to the policy. With one argument it asks
only that the claim is present, with any value - which is right here, because
any ward will do.

Nothing in `Ex1` itself changes. The 401 and the 403 both come out of the policy.
