// 05_efcore_basics / ex2 - one row, or an honest 404.
// See lessons/05_efcore_basics/README.md, "Exercise 2".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products/{id:int}", GetProduct);
    }

    // 200 with the whole Product row, or 404 when there is no such id.
    private static Task<IResult> GetProduct(int id, CatalogDb db) =>
        throw new NotImplementedException("ex2: GET /l05/products/{id} is not implemented yet - edit src/Api/L05_EfcoreBasics/Ex2.cs");
}
