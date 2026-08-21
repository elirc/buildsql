// 05_efcore_basics / review1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l05/review/products/cheapest", Cheapest);
    }

    private static async Task<IResult> Cheapest(int? limit, CatalogDb db)
    {
        int take = limit ?? 3;
        if (take < 1)
        {
            return TypedResults.BadRequest();
        }

        var items = await db.Products
            .OrderBy(p => p.PriceCents)
            .ThenBy(p => p.Name)
            .Take(take)
            .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
            .ToListAsync();

        return TypedResults.Ok(items);
    }
}
