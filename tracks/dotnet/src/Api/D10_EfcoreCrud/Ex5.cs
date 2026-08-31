// d10_efcore_crud / ex5 - change many rows without loading any.
// See lessons/d10_efcore_crud/README.md, "Exercise 5".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d10/members/regrade", Regrade);
    }

    // 200 with {"changed": …} - how many rows moved from the "from" grade to
    // the "to" grade. Both grades are required, and it has to cost the
    // database exactly ONE command however many rows match.
    private static Task<IResult> Regrade(D10Db db, string? from, string? to) =>
        throw new NotImplementedException(
            "ex5: POST /d10/members/regrade is not implemented yet - edit src/Api/D10_EfcoreCrud/Ex5.cs");
}
