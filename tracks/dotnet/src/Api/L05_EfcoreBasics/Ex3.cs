// 05_efcore_basics / ex3 - writing: Add, Remove, SaveChangesAsync.
// See lessons/05_efcore_basics/README.md, "Exercise 3".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l05/products", CreateProduct);
        app.MapDelete("/l05/products/{id:int}", DeleteProduct);
    }

    // 201 with a Location of /l05/products/{new id} and the created Product as
    // the body; 400 when the name is blank or priceCents is not positive.
    private static Task<IResult> CreateProduct(NewProduct request, CatalogDb db) =>
        throw new NotImplementedException("ex3: POST /l05/products is not implemented yet - edit src/Api/L05_EfcoreBasics/Ex3.cs");

    // 204 when the row was there and is now gone, 404 when it never was.
    private static Task<IResult> DeleteProduct(int id, CatalogDb db) =>
        throw new NotImplementedException("ex3: DELETE /l05/products/{id} is not implemented yet - edit src/Api/L05_EfcoreBasics/Ex3.cs");
}
