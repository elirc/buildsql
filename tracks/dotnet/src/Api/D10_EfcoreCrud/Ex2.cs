// d10_efcore_crud / ex2 - one row, or an honest 404.
// See lessons/d10_efcore_crud/README.md, "Exercise 2".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d10/members/{id:int}", GetMember);
        app.MapGet("/d10/members/by-email/{email}", GetByEmail);
    }

    // 200 with the whole member row, 404 when there is no such id.
    private static Task<IResult> GetMember(D10Db db, int id) =>
        throw new NotImplementedException(
            "ex2: GET /d10/members/{id:int} is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex2.cs");

    // 200 with the whole member row, 404 when nobody has that email. The match
    // is on a column that is not the primary key.
    private static Task<IResult> GetByEmail(D10Db db, string email) =>
        throw new NotImplementedException(
            "ex2: GET /d10/members/by-email/{email} is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex2.cs");
}
