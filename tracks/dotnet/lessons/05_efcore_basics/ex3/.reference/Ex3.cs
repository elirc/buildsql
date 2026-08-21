// 05_efcore_basics / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l05/products", CreateProduct);
        app.MapDelete("/l05/products/{id:int}", DeleteProduct);
    }

    private static async Task<IResult> CreateProduct(NewProduct request, CatalogDb db)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.PriceCents <= 0)
        {
            return TypedResults.BadRequest();
        }

        var product = new Product
        {
            Name = request.Name,
            PriceCents = request.PriceCents,
            Category = request.Category ?? "",
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/l05/products/{product.Id}", product);
    }

    private static async Task<IResult> DeleteProduct(int id, CatalogDb db)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
        {
            return TypedResults.NotFound();
        }

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
