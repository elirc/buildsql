## Hint 1

Do not add an `||` to the handler that already exists. A requirement is
satisfied when ANY handler for it succeeds, so a second way in is a second
handler - which can be written, tested and removed without touching the first.

## Hint 2

Fill in `WardLeadByRoleHandler` with the same shape as the grade one -
`if (context.User.IsInRole("charge")) context.Succeed(requirement);` - and then
register it in `Ex4Services` alongside the other:

    services.AddSingleton<IAuthorizationHandler, WardLeadByRoleHandler>();

Both are registered against the same interface, so both run.
