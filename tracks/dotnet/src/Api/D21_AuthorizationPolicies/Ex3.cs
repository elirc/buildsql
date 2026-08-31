// d21_authorization_policies / ex3 - a requirement and the handler that decides it.
// See lessons/d21_authorization_policies/README.md, "Exercise 3".

using Microsoft.AspNetCore.Authorization;

namespace DotnetDojo.Api.D21_AuthorizationPolicies;

// TODO ex3: this handler agrees with everybody. Succeed only when the caller's
// grade claim is at least the requirement's Grade - D21Claims.GradeOf reads it
// and returns 0 when there is none.
public class MinimumGradeHandler : AuthorizationHandler<MinimumGradeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, MinimumGradeRequirement requirement)
    {
        context.Succeed(requirement);

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

    // Given: the locked shifts, id ascending.
    private static IResult Locked(D21Roster roster) =>
        TypedResults.Ok(roster.All
            .Where(s => s.Locked)
            .OrderBy(s => s.Id)
            .Select(s => new ShiftDto(s.Id, s.Ward, s.Doctor, s.Day, s.Locked))
            .ToList());
}
