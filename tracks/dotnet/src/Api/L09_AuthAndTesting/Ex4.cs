// 09_auth_and_testing / ex4 - the client does not get to choose the owner.
// See lessons/09_auth_and_testing/README.md, "Exercise 4".

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l09/notes", CreateNote).RequireAuthorization();
    }

    // 400 when the text is blank; otherwise 201 with a Location of
    // /l09/notes/{new id} and the created note as the body.
    //
    // NewNote has an Owner property. It is a trap: the owner of a new note is
    // whoever the token says is calling, never whatever the body claims.
    private static IResult CreateNote(NewNote request, ClaimsPrincipal user, INoteStore store) =>
        throw new NotImplementedException("ex4: POST /l09/notes is not implemented yet - edit src/Api/L09_AuthAndTesting/Ex4.cs");
}
