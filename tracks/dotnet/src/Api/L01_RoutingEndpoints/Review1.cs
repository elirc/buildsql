// 01_routing_endpoints / review1 - spaced-review variant. Same ideas, new data.
// See lessons/01_routing_endpoints/README.md, "Review".

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/l01/review/products");
        group.MapGet("", ListProducts);
        group.MapGet("/{sku}", GetProduct);
    }

    // 200 with every product, cheapest first.
    private static IResult ListProducts() =>
        throw new NotImplementedException("review1: ListProducts is not implemented yet - edit src/Api/L01_RoutingEndpoints/Review1.cs");

    // 200 with the product for that sku, or 404.
    private static IResult GetProduct(string sku) =>
        throw new NotImplementedException("review1: GetProduct is not implemented yet - edit src/Api/L01_RoutingEndpoints/Review1.cs");
}
