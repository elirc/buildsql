// 09_auth_and_testing / challenge - the whole track, in one endpoint.
// See lessons/09_auth_and_testing/README.md, "Challenge".

using System.Security.Claims;

namespace DotnetDojo.Api.L09_AuthAndTesting;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l09/notes/{id:int}", Replace).RequireAuthorization();
    }

    // 400 when the text is blank.
    // 404 when there is no such note - and also when the note belongs to
    //     somebody else and the caller is not an admin, because "you may not
    //     see this" and "this does not exist" must look identical to a caller
    //     who is not allowed to know which it is.
    // 204 when the caller owns the note, or is in the "admin" role.
    private static IResult Replace(
        int id, UpdateNote request, ClaimsPrincipal user, INoteStore store) =>
        throw new NotImplementedException("challenge: PUT /l09/notes/{id} is not implemented yet - edit src/Api/L09_AuthAndTesting/Challenge.cs");
}
