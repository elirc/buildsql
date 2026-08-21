// 06_efcore_relationships / ex4 - the identity map, made visible.
// See lessons/06_efcore_relationships/README.md, "Exercise 4".

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/identity", Identity);
    }

    // Load orders 1 and 3 - which belong to the same customer - with their
    // Customer navigation filled in, tracked when `tracked` is true and with
    // AsNoTracking when it is false.
    //
    // 200 with {"sameInstance": <are the two Customer objects the same object
    // in memory?>, "customerName": <that customer's name>}.
    private static Task<IResult> Identity(bool tracked, OrdersDb db) =>
        throw new NotImplementedException("ex4: GET /l06/identity is not implemented yet - edit src/Api/L06_EfcoreRelationships/Ex4.cs");
}
