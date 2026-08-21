// i2_interview_drills / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex4Services : IServiceRegistrar
{
    public const string AuditorsOnly = "i2-auditors-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(AuditorsOnly, policy => policy
                .AddAuthenticationSchemes(I2Jwt.Scheme)
                .RequireAuthenticatedUser()
                .RequireRole("auditor"));
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/i2/audit/logs", Logs)
            .RequireAuthorization(Ex4Services.AuditorsOnly);
    }

    private static IResult Logs() => TypedResults.Ok(AuditLog.Entries);
}
