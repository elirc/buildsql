// d21_authorization_policies / ex2 - a requirement that has to look at the request.
// See lessons/d21_authorization_policies/README.md, "Exercise 2".

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.SameWard, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                // TODO ex2: a caller may only read the ward in the URL when it
                // is their own ward - unless they are a charge nurse, who may
                // read any of them. The route value is reachable from the
                // authorization context.
                .RequireAuthenticatedUser());
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster/{ward}", ForWard).RequireAuthorization(D21Policies.SameWard);
    }

    // Given: that ward's shifts, id ascending.
    private static IResult ForWard(string ward, D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Where(s => s.Ward == ward)
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
