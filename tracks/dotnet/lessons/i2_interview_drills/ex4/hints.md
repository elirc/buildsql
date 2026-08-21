## Hint 1

Two edits and neither is in the handler. Register a policy; apply it to the
endpoint.

You are not writing either status code — 401 and 403 both come from the
framework once it knows what the endpoint requires.

## Hint 2

```csharp
services.AddAuthorizationBuilder()
    .AddPolicy(AuditorsOnly, policy => policy
        .AddAuthenticationSchemes(/* … */)
        .RequireAuthenticatedUser()
        .RequireRole(/* … */));
```

`AddAuthenticationSchemes` matters here: this application has more than one
bearer scheme, and without naming one the policy would use the default, which
belongs to a different lesson. The name is on `I2Jwt`.

Then pass the policy name to `RequireAuthorization` where the route is mapped.

## Hint 3

```csharp
app.MapGet("/i2/audit/logs", Logs)
    .RequireAuthorization(Ex4Services.AuditorsOnly);
```

If an auditor token comes back 403, check `RoleClaimType` in `Model.cs` — it is
set to `"role"`, and `RequireRole` looks for claims of exactly that type.

If you get a "policy not found" exception, the string in `AddPolicy` and the one
in `RequireAuthorization` differ; using the `AuditorsOnly` constant for both
makes that impossible.
