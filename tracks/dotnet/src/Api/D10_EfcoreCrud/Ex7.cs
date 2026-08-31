// d10_efcore_crud / ex7 - PUT as upsert.
// See lessons/d10_efcore_crud/README.md, "Exercise 7".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d10/roster/{email}", Upsert);
    }

    // The client names the resource, so this PUT can create it.
    //
    //   nobody has that email  -> 201, Location /d10/members/{id}, the member
    //   somebody does          -> 204, and their name and credits are replaced
    //   blank name or negative credits -> 400, writing nothing
    //
    // A member created here starts at grade "white".
    private static Task<IResult> Upsert(D10Db db, string email, UpsertMember request) =>
        throw new NotImplementedException(
            "ex7: PUT /d10/roster/{email} is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex7.cs");
}
