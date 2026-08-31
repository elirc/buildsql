// d20_auth_jwt / ex1 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
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

                // Four independent questions, and a token has to answer all
                // four: was this signed with MY key, by the issuer I trust,
                // for MY audience, and is it still in date. The
                // SignatureValidator is gone entirely - overriding it is how
                // the first question stops being asked at all.
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = D20Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = D20Jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = D20Jwt.SigningKey,
                    ValidateLifetime = true,
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

    private static IResult WhoAmI(ClaimsPrincipal user) =>
        TypedResults.Ok(new WhoAmI(user.Identity?.Name ?? ""));
}
