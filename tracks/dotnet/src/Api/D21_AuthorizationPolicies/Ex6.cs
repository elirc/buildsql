// d21_authorization_policies / ex6 - one policy, a whole group.
// See lessons/d21_authorization_policies/README.md, "Exercise 6".

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public record OpsSummary(int Shifts, int Locked);

public class Ex6Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Ops, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                .RequireClaim(D21Claims.Ward)
                .RequireRole("charge"));
    }
}

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex6: the policy above is correct and nothing applies it, so
        // both endpoints below are wide open. Requiring it on each MapGet
        // works today and is one forgotten line away from a hole - put it on
        // the group instead.
        var ops = app.MapGroup("/d21/ops");

        ops.MapGet("/summary", Summary);
        ops.MapGet("/wards", Wards);
    }

    // Given: how many shifts there are, and how many of them are locked.
    private static IResult Summary(D21Roster roster) =>
        TypedResults.Ok(new OpsSummary(roster.All.Count, roster.All.Count(s => s.Locked)));

    // Given: the wards, alphabetically.
    private static IResult Wards(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Select(s => s.Ward)
            .Distinct()
            .OrderBy(w => w, StringComparer.Ordinal)
            .ToList());
}
