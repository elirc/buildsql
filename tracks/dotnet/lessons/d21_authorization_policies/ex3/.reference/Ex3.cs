// d21_authorization_policies / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

public class MinimumGradeHandler : AuthorizationHandler<MinimumGradeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, MinimumGradeRequirement requirement)
    {
        // The bound comes from the requirement, not from a constant here - the
        // handler implements "at least this grade", and the policy decides
        // which grade.
        if (D21Claims.GradeOf(context.User) >= requirement.Grade)
        {
            context.Succeed(requirement);
        }

        // Not succeeding is enough. Calling Fail would refuse the requirement
        // outright, which is a different and much stronger statement.
        return Task.CompletedTask;
    }
}

public class Ex3Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuthorizationHandler, MinimumGradeHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy(D21Policies.Senior, policy => policy
                .AddAuthenticationSchemes(D21Jwt.Scheme)
                .RequireAuthenticatedUser()
                .AddRequirements(new MinimumGradeRequirement(5)));
    }
}

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d21/roster/locked", Locked).RequireAuthorization(D21Policies.Senior);
    }

    private static IResult Locked(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Where(s => s.Locked)
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
