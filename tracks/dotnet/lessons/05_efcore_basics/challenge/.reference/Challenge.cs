// 05_efcore_basics / challenge - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/products/page", GetPage);
    }

    private static async Task<IResult> GetPage(int? page, int? size, CatalogDb db)
    {
        int wanted = page ?? 1;
        int perPage = size ?? 2;

        if (wanted < 1 || perPage < 1 || perPage > 50)
        {
            return TypedResults.BadRequest();
        }

        int total = await db.Products.CountAsync();

        var items = await db.Products
            .OrderBy(p => p.Name)
            .Skip((wanted - 1) * perPage)
            .Take(perPage)
            .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
            .ToListAsync();

        return TypedResults.Ok(new ProductPage(items, total, wanted, perPage));
    }
}
