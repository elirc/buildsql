// d21_authorization_policies / ex5 - the decision needs the thing being decided about.
// See lessons/d21_authorization_policies/README.md, "Exercise 5".

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

// TODO ex5: succeed when the shift being edited belongs to the caller, or the
// caller is the charge nurse. The RESOURCE - the shift - is the third
// parameter, which is why this handler cannot run at the endpoint.
public class ShiftOwnerHandler : AuthorizationHandler<ShiftOwnerRequirement, Shift>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ShiftOwnerRequirement requirement, Shift resource) =>
        Task.CompletedTask;
}

public class Ex5Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuthorizationHandler, ShiftOwnerHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Editor, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser())
            .AddPolicy(D21Policies.EditShift, policy => policy
                .AddRequirements(new ShiftOwnerRequirement()));
    }
}

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d21/shifts/{id:int}/day", SetDay).RequireAuthorization(D21Policies.Editor);
    }

    // 404 when there is no such shift. 403 when the D21Policies.EditShift
    // policy does not allow this caller to edit THIS shift. 400 as a
    // validation problem keyed "day" when the day is outside 1..7. Otherwise
    // 204, with the day written.
    private static Task<IResult> SetDay(
        int id,
        DayChange body,
        ClaimsPrincipal user,
        D21Roster roster,
        IAuthorizationService authorization)
    {
        var shift = roster.Find(id);
        if (shift is null)
        {
            return Task.FromResult<IResult>(TypedResults.NotFound());
        }

        // TODO ex5: nobody has asked whether this caller may edit THIS shift,
        // so any authenticated caller can move anybody else's.
        if (body.Day < 1 || body.Day > 7)
        {
            return Task.FromResult<IResult>(TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["day"] = ["A day is 1 to 7."] }));
        }

        shift.Day = body.Day;

        return Task.FromResult<IResult>(TypedResults.NoContent());
    }
}
