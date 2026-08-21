// 05_efcore_basics / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products/{id:int}", GetProduct);
    }

    private static async Task<IResult> GetProduct(int id, CatalogDb db)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
    }
}
