// 09_auth_and_testing / ex1 - who is calling?
// See lessons/09_auth_and_testing/README.md, "Exercise 1".

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public record WhoAmIResponse(string Name);

public class Ex1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // TODO ex1: register JWT bearer authentication, and authorization.
        //
        // Until you do, every endpoint below answers 500 rather than 401:
        // asking for authorization when nothing in the application knows how to
        // authorize is a configuration error, not a rejected request.
    }
}

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l09/whoami", WhoAmI).RequireAuthorization();
    }

    // 200 with {"name": <the caller's subject>}.
    private static IResult WhoAmI(ClaimsPrincipal user) =>
        throw new NotImplementedException("ex1: GET /l09/whoami is not implemented yet - edit src/Api/L09_AuthAndTesting/Ex1.cs");
}
