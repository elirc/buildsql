## Hint 1

Two places to edit. `Ex1Services.Register` needs to tell the container about a
bearer scheme and about authorization; `WhoAmI` needs to read one value off the
`ClaimsPrincipal` it was handed.

Start with the registration, run the gate, and watch the 500 become a 401. That
transition is the proof that the pipeline picked up your services.

## Hint 2

The registration is a chain:

```csharp
services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* … */ });

services.AddAuthorization();
```

Inside the options, set `MapInboundClaims = false` and build a
`TokenValidationParameters` with all four validations turned on and pointed at
`JwtSettings.Issuer`, `JwtSettings.Audience` and `JwtSettings.SigningKey`. Set
`NameClaimType = "sub"` and `RoleClaimType = "role"` so the framework knows which
claims mean "name" and "role".

You will need `using Microsoft.AspNetCore.Authentication.JwtBearer;` and
`using Microsoft.IdentityModel.Tokens;`.

## Hint 3

Each gate failure maps to one flag: a wrong-key token needs
`ValidateIssuerSigningKey`, an old token needs `ValidateLifetime`, a
`somebody-else` token needs `ValidateIssuer`. All of them default to true, but
supplying a `TokenValidationParameters` without setting them turns them off, so
write them out.

The handler is one line:

```csharp
private static IResult WhoAmI(ClaimsPrincipal user) =>
    TypedResults.Ok(new WhoAmIResponse(user.Identity?.Name ?? ""));
```

`Identity.Name` is the `sub` claim *because* you set `NameClaimType`.
