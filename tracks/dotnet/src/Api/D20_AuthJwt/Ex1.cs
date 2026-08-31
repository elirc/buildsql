// d20_auth_jwt / ex1 - a token you did not check is a claim you believed.
// See lessons/d20_auth_jwt/README.md, "Exercise 1".

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.D20_AuthJwt;

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddAuthentication()
            .AddJwtBearer(D20Jwt.StrictScheme, options =>
            {
                options.MapInboundClaims = false;

                // TODO ex1: as shipped this scheme accepts absolutely any
                // bearer token whose payload parses - forged, expired, and
                // minted by anybody at all. Turn each check back on and give
                // it the value it needs from D20Jwt.
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = false,
                    SignatureValidator = (token, parameters) => new JsonWebToken(token),
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d20/strict/whoami", WhoAmI)
            .RequireAuthorization(new AuthorizeAttribute
            {
                AuthenticationSchemes = D20Jwt.StrictScheme,
            });
    }

    // Given: 200 with the caller's subject.
    private static IResult WhoAmI(ClaimsPrincipal user) =>
        TypedResults.Ok(new WhoAmI(user.Identity?.Name ?? ""));
}
