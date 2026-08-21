// 05_efcore_basics / review1 - spaced-review variant: filter, order, limit, project.
// See lessons/05_efcore_basics/README.md, "Review".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/review/products/cheapest", Cheapest);
    }

    // 200 with the `limit` cheapest products as ProductSummary, price ascending
    // and name ascending to break ties. limit defaults to 3; limit < 1 is 400.
    private static Task<IResult> Cheapest(int? limit, CatalogDb db) =>
        throw new NotImplementedException("review1: GET /l05/review/products/cheapest is not implemented yet - edit src/Api/L05_EfcoreBasics/Review1.cs");
}
