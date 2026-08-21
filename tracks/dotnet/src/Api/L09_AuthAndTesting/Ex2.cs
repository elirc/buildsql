// 09_auth_and_testing / ex2 - authentication is not authorization.
// See lessons/09_auth_and_testing/README.md, "Exercise 2".

namespace DotnetDojo.Api.L09_AuthAndTesting;

public record ReportResponse(string Title);

public class Ex2Services : IServiceRegistrar
{
    public const string AdminOnly = "admin-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex2: add an authorization policy named AdminOnly that requires
        // the caller to be in the "admin" role.
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex2: this endpoint currently lets anyone in. Require the policy.
        app.MapGet("/l09/admin/reports", Reports);
    }

    // 200 with {"title": "Quarterly numbers"}.
    private static IResult Reports() =>
        TypedResults.Ok(new ReportResponse("Quarterly numbers"));
}
