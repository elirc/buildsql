// d21_authorization_policies / ex8 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class Ex8Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Full, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                // Two requirements, so BOTH must hold - an AND, unlike ex2,
                // where one assertion expressed an OR.
                .RequireClaim(D21Claims.Ward)
                .RequireAssertion(context => D21Claims.GradeOf(context.User) >= 5));
    }
}

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d21/shifts", Create).RequireAuthorization(D21Policies.Full);
    }

    private static IResult Create(NewShift body, ClaimsPrincipal user, D21Roster roster)
    {
        if (body.Day < 1 || body.Day > 7)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["day"] = ["A day is 1 to 7."],
            });
        }

        // body.Ward is never read. The ward comes from the claim the policy
        // has just insisted on, exactly as the doctor comes from the subject.
        var shift = roster.Add(
            D21Claims.WardOf(user) ?? "",
            user.Identity?.Name ?? "",
            body.Day);

        return TypedResults.Created(
            $"/d21/shifts/{shift.Id}",
            new ShiftDto(shift.Id, shift.Ward, shift.Doctor, shift.Day, shift.Locked));
    }
}
