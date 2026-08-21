// 06_efcore_relationships / ex2 - many-to-many, from both ends.
// See lessons/06_efcore_relationships/README.md, "Exercise 2".

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/products/{id:int}/tags", TagsOfProduct);
        app.MapGet("/l06/tags/{name}/products", ProductsWithTag);
    }

    // 200 with that product's tag names, A-Z; 404 when the product does not exist.
    private static Task<IResult> TagsOfProduct(int id, OrdersDb db) =>
        throw new NotImplementedException("ex2: GET /l06/products/{id}/tags is not implemented yet - edit src/Api/L06_EfcoreRelationships/Ex2.cs");

    // 200 with the names of the products carrying that tag, A-Z; 404 when no
    // tag has that name.
    private static Task<IResult> ProductsWithTag(string name, OrdersDb db) =>
        throw new NotImplementedException("ex2: GET /l06/tags/{name}/products is not implemented yet - edit src/Api/L06_EfcoreRelationships/Ex2.cs");
}
