// 05_efcore_basics / ex4 - change tracking, proved.
// See lessons/05_efcore_basics/README.md, "Exercise 4".

namespace DotnetDojo.Api.L05_EfcoreBasics;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l05/products/{id:int}/rename", Rename);
    }

    // Load the product - tracked when `tracked` is true, with AsNoTracking when
    // it is false - assign the new name, then save.
    //
    // 200 with {"changes": <what SaveChangesAsync returned>, "name": <the name
    // now on the object you loaded>}, or 404 when there is no such product.
    private static Task<IResult> Rename(int id, string name, bool tracked, CatalogDb db) =>
        throw new NotImplementedException("ex4: POST /l05/products/{id}/rename is not implemented yet - edit src/Api/L05_EfcoreBasics/Ex4.cs");
}
