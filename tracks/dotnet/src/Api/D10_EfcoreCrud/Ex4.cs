// d10_efcore_crud / ex4 - load, change, save.
// See lessons/d10_efcore_crud/README.md, "Exercise 4".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/d10/members/{id:int}/credits", SetCredits);
        app.MapDelete("/d10/members/{id:int}", Delete);
    }

    // 204 when the member exists and the change stuck; 404 when there is no
    // such member; 400 for negative credits, which must write nothing.
    private static Task<IResult> SetCredits(D10Db db, int id, CreditChange request) =>
        throw new NotImplementedException(
            "ex4: PUT /d10/members/{id:int}/credits is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex4.cs");

    // 204 when the row was there and is now gone, 404 when it was not.
    private static Task<IResult> Delete(D10Db db, int id) =>
        throw new NotImplementedException(
            "ex4: DELETE /d10/members/{id:int} is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex4.cs");
}
