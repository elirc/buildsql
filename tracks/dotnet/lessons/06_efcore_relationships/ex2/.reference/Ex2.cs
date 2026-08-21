// 06_efcore_relationships / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/products/{id:int}/tags", TagsOfProduct);
        app.MapGet("/l06/tags/{name}/products", ProductsWithTag);
    }

    private static async Task<IResult> TagsOfProduct(int id, OrdersDb db)
    {
        if (!await db.Products.AnyAsync(p => p.Id == id))
        {
            return TypedResults.NotFound();
        }

        var names = await db.Products
            .Where(p => p.Id == id)
            .SelectMany(p => p.Tags)
            .Select(t => t.Name)
            .OrderBy(name => name)
            .ToListAsync();

        return TypedResults.Ok(names);
    }

    private static async Task<IResult> ProductsWithTag(string name, OrdersDb db)
    {
        if (!await db.Tags.AnyAsync(t => t.Name == name))
        {
            return TypedResults.NotFound();
        }

        var names = await db.Tags
            .Where(t => t.Name == name)
            .SelectMany(t => t.Products)
            .Select(p => p.Name)
            .OrderBy(productName => productName)
            .ToListAsync();

        return TypedResults.Ok(names);
    }
}
