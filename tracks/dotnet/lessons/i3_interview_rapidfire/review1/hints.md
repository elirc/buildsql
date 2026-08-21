## Hint 1

One policy, one `RequireAuthorization`. You write neither status code — the
framework produces 401 when there is no identity and 403 when there is one that
fails the policy.

The scheme to authenticate against is on `I2Jwt`; it is already registered.

## Hint 2

```csharp
services.AddAuthorizationBuilder()
    .AddPolicy(MembersOnly, policy => policy
        .AddAuthenticationSchemes(/* … */)
        .RequireAuthenticatedUser()
        .RequireRole(/* … */));
```

`AddAuthenticationSchemes` is not optional here: this application has more than
one bearer scheme, and without naming one the policy falls back to the default,
which belongs to a different lesson.

Then pass the policy name to `RequireAuthorization` where the route is mapped.

## Hint 3

```csharp
app.MapGet("/i3/review/secret", Secret)
    .RequireAuthorization(Review1Services.MembersOnly);
```

Say the difference out loud before you run it: 401 means *authenticate and try
again*; 403 means *credentials will not help*.
