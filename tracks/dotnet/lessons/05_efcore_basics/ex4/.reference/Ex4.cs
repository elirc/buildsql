// 05_efcore_basics / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l05/products/{id:int}/rename", Rename);
    }

    private static async Task<IResult> Rename(int id, string name, bool tracked, CatalogDb db)
    {
        IQueryable<Product> query = tracked
            ? db.Products.AsQueryable()
            : db.Products.AsNoTracking();

        var product = await query.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return TypedResults.NotFound();
        }

        product.Name = name;
        int changes = await db.SaveChangesAsync();

        return TypedResults.Ok(new RenameResult(changes, product.Name));
    }
}
