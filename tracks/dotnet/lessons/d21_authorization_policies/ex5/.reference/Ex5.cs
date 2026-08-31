// d21_authorization_policies / ex5 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class ShiftOwnerHandler : AuthorizationHandler<ShiftOwnerRequirement, Shift>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ShiftOwnerRequirement requirement, Shift resource)
    {
        if (resource.Doctor == context.User.Identity?.Name || context.User.IsInRole("charge"))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
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

    private static async Task<IResult> SetDay(
        int id,
        DayChange body,
        ClaimsPrincipal user,
        D21Roster roster,
        IAuthorizationService authorization)
    {
        var shift = roster.Find(id);
        if (shift is null)
        {
            return TypedResults.NotFound();
        }

        // The resource exists now, so the question that needed it can finally
        // be asked - and it is asked before the payload is looked at.
        var decision = await authorization.AuthorizeAsync(user, shift, D21Policies.EditShift);
        if (!decision.Succeeded)
        {
            return TypedResults.Forbid(authenticationSchemes: [D21Jwt.Scheme]);
        }

        if (body.Day < 1 || body.Day > 7)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["day"] = ["A day is 1 to 7."],
            });
        }

        shift.Day = body.Day;

        return TypedResults.NoContent();
    }
}
