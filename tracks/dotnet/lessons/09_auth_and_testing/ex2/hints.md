## Hint 1

Two edits, neither of them in the handler. One registers a rule; the other
attaches it to the endpoint.

Note what you are *not* writing: no `if (user.IsInRole(...))`, no
`return TypedResults.Forbid()`. Both status codes come out of the framework once
you have told it what the endpoint requires.

## Hint 2

Register the policy in `Ex2Services.Register`:

```csharp
services.AddAuthorizationBuilder()
    .AddPolicy(AdminOnly, policy => policy.RequireRole("admin"));
```

`AddAuthorizationBuilder()` also registers the authorization services, so it
stands in for `AddAuthorization()`.

Then attach it where the route is mapped, by passing the policy's name to
`RequireAuthorization`.

## Hint 3

```csharp
app.MapGet("/l09/admin/reports", Reports)
    .RequireAuthorization(Ex2Services.AdminOnly);
```

If an admin token comes back 403, the role claim is not being recognised — check
that ex1 set `RoleClaimType = "role"`, because `RequireRole` looks for claims of
whatever type that names.

If a policy-not-found exception appears, the name in `AddPolicy` and the name in
`RequireAuthorization` do not match; using the `AdminOnly` constant for both makes
that impossible.
