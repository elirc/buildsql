// 01_routing_endpoints / review1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/l01/review/products");
        group.MapGet("", ListProducts);
        group.MapGet("/{sku}", GetProduct);
    }

    private static IResult ListProducts() =>
        TypedResults.Ok(Catalog.Products.OrderBy(p => p.PriceCents).ToList());

    private static IResult GetProduct(string sku)
    {
        var product = Catalog.Products.FirstOrDefault(p => p.Sku == sku);
        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
    }
}
