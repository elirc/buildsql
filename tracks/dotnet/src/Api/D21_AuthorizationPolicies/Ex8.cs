// d21_authorization_policies / ex8 - the policy and the handler agree.
// See lessons/d21_authorization_policies/README.md, "Exercise 8".

using System.Security.Claims;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Full, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                // TODO ex8: creating a shift needs a caller who is on a ward
                // AND is senior - grade 5 or above. There is no handler to
                // write here: one of these two is a built-in, and the other is
                // a one-line assertion.
                .RequireAuthenticatedUser());
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d21/shifts", Create).RequireAuthorization(D21Policies.Full);
    }

    // 400 as a validation problem keyed "day" when the day is outside 1..7.
    // Otherwise 201 with Location /d21/shifts/{newId} and the created
    // ShiftDto: doctor is the caller's subject, and ward is the caller's WARD
    // CLAIM - NewShift.Ward is a trap.
    private static IResult Create(NewShift body, ClaimsPrincipal user, D21Roster roster) =>
        throw new NotImplementedException(
            "ex8: POST /d21/shifts is not implemented yet - edit src/Api/D21_AuthorizationPolicies/Ex8.cs");
}
