// 09_auth_and_testing / ex2 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L09_AuthAndTesting;

public record ReportResponse(string Title);

public class Ex2Services : IServiceRegistrar
{
    public const string AdminOnly = "admin-only";

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(AdminOnly, policy => policy.RequireRole("admin"));
    }
}

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l09/admin/reports", Reports)
            .RequireAuthorization(Ex2Services.AdminOnly);
    }

    private static IResult Reports() =>
        TypedResults.Ok(new ReportResponse("Quarterly numbers"));
}
