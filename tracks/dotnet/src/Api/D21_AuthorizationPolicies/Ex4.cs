// d21_authorization_policies / ex4 - two handlers, one requirement.
// See lessons/d21_authorization_policies/README.md, "Exercise 4".

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

// TODO ex4: the other way to be a ward lead is to be the charge nurse. Write
// this handler, and register it alongside the one above.
public class WardLeadByRoleHandler : AuthorizationHandler<WardLeadRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, WardLeadRequirement requirement) =>
        Task.CompletedTask;
}

public class Ex4Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuthorizationHandler, WardLeadByGradeHandler>();

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

    // Given: the wards, alphabetically, one entry each.
    private static IResult Leads(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Select(s => s.Ward)
            .Distinct()
            .OrderBy(w => w, StringComparer.Ordinal)
            .ToList());
}
