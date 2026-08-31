// d21_authorization_policies / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

/// <summary>Given: one way to be a ward lead - grade 8 or above.</summary>
public class WardLeadByGradeHandler : AuthorizationHandler<WardLeadRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, WardLeadRequirement requirement)
    {
        if (D21Claims.GradeOf(context.User) >= 8)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

/// <summary>The other way: being the charge nurse. A separate handler, not an extra clause.</summary>
public class WardLeadByRoleHandler : AuthorizationHandler<WardLeadRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, WardLeadRequirement requirement)
    {
        if (context.User.IsInRole("charge"))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Both are registered against the same interface, so both run, and the
        // requirement is met as soon as either says yes.
        services.AddSingleton<IAuthorizationHandler, WardLeadByGradeHandler>();
        services.AddSingleton<IAuthorizationHandler, WardLeadByRoleHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.WardLead, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                .AddRequirements(new WardLeadRequirement()));
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster/leads", Leads).RequireAuthorization(D21Policies.WardLead);
    }

    private static IResult Leads(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Select(s => s.Ward)
            .Distinct()
            .OrderBy(w => w, StringComparer.Ordinal)
            .ToList());
}
