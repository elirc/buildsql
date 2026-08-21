// 05_efcore_basics / challenge - a page of results, and the count that goes with it.
// See lessons/05_efcore_basics/README.md, "Challenge".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products/page", GetPage);
    }

    // 200 with {"items": [...], "total": …, "page": …, "size": …} - one page of
    // products by name ascending, and the total number of rows in the table.
    // page defaults to 1 and size to 2; page < 1, size < 1 or size > 50 is 400.
    private static Task<IResult> GetPage(int? page, int? size, CatalogDb db) =>
        throw new NotImplementedException("challenge: GET /l05/products/page is not implemented yet - edit src/Api/L05_EfcoreBasics/Challenge.cs");
}
