// d11_efcore_queries / ex5 - a page and its total.
// See lessons/d11_efcore_queries/README.md, "Exercise 5".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D11_EfcoreQueries;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d11/enrolments", ListEnrolments);
    }

    // 200 with {"items": [{"id": …, "score": …}], "total": …, "page": …,
    // "size": …}, id ascending.
    //
    // page is 1-based and defaults to 1; size defaults to 3 and may not exceed
    // 50; anything outside that is a 400. It costs exactly TWO SQL commands -
    // the page and the count - however big the table is.
    private static Task<IResult> ListEnrolments(D11Db db, int? page, int? size) =>
        throw new NotImplementedException(
            "ex5: GET /d11/enrolments is not implemented yet - edit src/Api/D11_EfcoreQueries/Ex5.cs");
}
