// 06_efcore_relationships / ex1 - loading the "many" side.
// See lessons/06_efcore_relationships/README.md, "Exercise 1".

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/customers/{id:int}", GetCustomer);
    }

    // 200 with a CustomerDetail - the customer plus their orders, id ascending -
    // or 404 when there is no such customer. A customer with no orders is a 200
    // with an empty list.
    private static Task<IResult> GetCustomer(int id, OrdersDb db) =>
        throw new NotImplementedException("ex1: GET /l06/customers/{id} is not implemented yet - edit src/Api/L06_EfcoreRelationships/Ex1.cs");
}
