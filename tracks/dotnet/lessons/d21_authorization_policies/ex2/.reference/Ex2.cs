// d21_authorization_policies / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex2Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.SameWard, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                // One assertion, because the two ways in are an OR. Two
                // RequireX calls would have to BOTH hold, which is not the
                // rule - and the ward being asked for lives on the request, so
                // the context's Resource is where it has to come from.
                .RequireAssertion(context =>
                {
                    if (context.User.IsInRole("charge"))
                    {
                        return true;
                    }

                    string? ward = (context.Resource as HttpContext)?
                        .Request.RouteValues["ward"] as string;

                    return ward is not null && ward == D21Claims.WardOf(context.User);
                }));
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster/{ward}", ForWard).RequireAuthorization(D21Policies.SameWard);
    }

    private static IResult ForWard(string ward, D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Where(s => s.Ward == ward)
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
