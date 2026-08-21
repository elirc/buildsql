// 06_efcore_relationships / review1 - spaced-review variant: two hops, one projection.
// See lessons/06_efcore_relationships/README.md, "Review".

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/review/orders/{id:int}/lines", Lines);
    }

    // 200 with one LineDetail per line of that order - the product's name, the
    // quantity, and quantity * unit price - product name ascending. 404 when
    // there is no such order.
    private static Task<IResult> Lines(int id, OrdersDb db) =>
        throw new NotImplementedException("review1: GET /l06/review/orders/{id}/lines is not implemented yet - edit src/Api/L06_EfcoreRelationships/Review1.cs");
}
