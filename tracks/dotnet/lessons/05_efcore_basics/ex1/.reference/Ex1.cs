// 05_efcore_basics / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products", ListProducts);
    }

    private static async Task<IResult> ListProducts(CatalogDb db)
    {
        var products = await db.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
            .ToListAsync();

        return TypedResults.Ok(products);
    }
}
