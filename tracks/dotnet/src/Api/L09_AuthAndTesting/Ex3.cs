// 09_auth_and_testing / ex3 - the token decides what you can see.
// See lessons/09_auth_and_testing/README.md, "Exercise 3".

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l09/notes", ListNotes).RequireAuthorization();
    }

    // 200 with the caller's own notes, id ascending - and nobody else's.
    private static IResult ListNotes(ClaimsPrincipal user, INoteStore store) =>
        throw new NotImplementedException("ex3: GET /l09/notes is not implemented yet - edit src/Api/L09_AuthAndTesting/Ex3.cs");
}
