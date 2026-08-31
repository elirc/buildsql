// d21_authorization_policies / ex1 - a policy is a list of requirements.
// See lessons/d21_authorization_policies/README.md, "Exercise 1".

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.OnWard, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                // TODO ex1: as shipped, any valid token gets in - including
                // one for somebody who works at head office and has no ward at
                // all. The roster is ward staff only.
                .RequireAuthenticatedUser());
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster", All).RequireAuthorization(D21Policies.OnWard);
    }

    // Given: every shift, id ascending.
    private static IResult All(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
