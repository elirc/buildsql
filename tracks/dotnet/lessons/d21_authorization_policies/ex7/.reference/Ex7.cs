// d21_authorization_policies / ex7 - reference solution (author only, used by `dojo verify`).

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

/// <summary>Given: the owner or the charge nurse may remove a shift.</summary>
public class ShiftRemovalOwnerHandler : AuthorizationHandler<ShiftRemovalRequirement, Shift>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ShiftRemovalRequirement requirement, Shift resource)
    {
        if (resource.Doctor == context.User.Identity?.Name || context.User.IsInRole("charge"))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

public class ShiftLockHandler : AuthorizationHandler<ShiftRemovalRequirement, Shift>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ShiftRemovalRequirement requirement, Shift resource)
    {
        // Fail, not silence. Silence merely declines to be a reason to allow
        // it, and the owner handler has already supplied one; Fail is a veto,
        // and it holds however many handlers have succeeded before or after.
        if (resource.Locked)
        {
            context.Fail();
        }

        return Task.CompletedTask;
    }
}

public class Ex7Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuthorizationHandler, ShiftRemovalOwnerHandler>();
        services.AddSingleton<IAuthorizationHandler, ShiftLockHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Remover, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser())
            .AddPolicy(D21Policies.DeleteShift, policy => policy
                .AddRequirements(new ShiftRemovalRequirement()));
    }
}

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/d21/shifts/{id:int}", Remove).RequireAuthorization(D21Policies.Remover);
    }

    private static async Task<IResult> Remove(
        int id, ClaimsPrincipal user, D21Roster roster, IAuthorizationService authorization)
    {
        var shift = roster.Find(id);
        if (shift is null)
        {
            return TypedResults.NotFound();
        }

        var decision = await authorization.AuthorizeAsync(user, shift, D21Policies.DeleteShift);
        if (!decision.Succeeded)
        {
            return TypedResults.Forbid(authenticationSchemes: [D21Jwt.Scheme]);
        }

        roster.Remove(shift);

        return TypedResults.NoContent();
    }
}
