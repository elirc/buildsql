// 09_auth_and_testing / ex1 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public record WhoAmIResponse(string Name);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = JwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = JwtSettings.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = JwtSettings.SigningKey,
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "role",
                };
            });

        services.AddAuthorization();
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l09/whoami", WhoAmI).RequireAuthorization();
    }

    private static IResult WhoAmI(ClaimsPrincipal user) =>
        TypedResults.Ok(new WhoAmIResponse(user.Identity?.Name ?? ""));
}
