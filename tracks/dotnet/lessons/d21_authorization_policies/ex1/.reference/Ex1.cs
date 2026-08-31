// d21_authorization_policies / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.OnWard, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                // The requirement was never "has a token"; it is "works on a
                // ward". RequireClaim asks for the claim to be present, with
                // any value at all.
                .RequireClaim(D21Claims.Ward));
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster", All).RequireAuthorization(D21Policies.OnWard);
    }

    private static IResult All(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
