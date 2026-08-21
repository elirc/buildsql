// 05_efcore_basics / ex1 - your first query, and your first projection.
// See lessons/05_efcore_basics/README.md, "Exercise 1".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products", ListProducts);
    }

    // 200 with every product as a ProductSummary, name ascending.
    private static Task<IResult> ListProducts(CatalogDb db) =>
        throw new NotImplementedException("ex1: GET /l05/products is not implemented yet - edit src/Api/L05_EfcoreBasics/Ex1.cs");
}
