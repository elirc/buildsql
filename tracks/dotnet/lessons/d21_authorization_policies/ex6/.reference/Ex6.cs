// d21_authorization_policies / ex6 - reference solution (author only, used by `dojo verify`).

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
        // One line, on the group. Every endpoint added under it from now on is
        // protected the moment it is written, which is a property no amount of
        // discipline about per-endpoint calls can give you.
        var ops = app.MapGroup("/d21/ops").RequireAuthorization(D21Policies.Ops);

        ops.MapGet("/summary", Summary);
        ops.MapGet("/wards", Wards);
    }

    private static IResult Summary(D21Roster roster) =>
        TypedResults.Ok(new OpsSummary(roster.All.Count, roster.All.Count(s => s.Locked)));

    private static IResult Wards(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Select(s => s.Ward)
            .Distinct()
            .OrderBy(w => w, StringComparer.Ordinal)
            .ToList());
}
