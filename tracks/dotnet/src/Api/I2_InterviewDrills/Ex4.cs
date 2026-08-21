// i2_interview_drills / ex4 - "secure this endpoint, then test it." Time-box: 20 minutes.
// See lessons/i2_interview_drills/README.md, "Drill 4".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Ex4Services : IServiceRegistrar
{
    public const string AuditorsOnly = "i2-auditors-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex4: add a policy named AuditorsOnly that authenticates with
        // I2Jwt.Scheme and requires the "auditor" role.
        //
        // The bearer scheme itself is already registered for you in Model.cs.
    }
}

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex4: this endpoint is wide open. Require the policy.
        app.MapGet("/i2/audit/logs", Logs);
    }

    // Given code.
    private static IResult Logs() => TypedResults.Ok(AuditLog.Entries);
}
