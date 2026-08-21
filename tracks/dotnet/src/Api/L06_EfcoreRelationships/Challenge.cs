// 06_efcore_relationships / challenge - an aggregate across three tables, in one query.
// See lessons/06_efcore_relationships/README.md, "Challenge".

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/customers/top", TopCustomers);
    }

    // 200 with the top `limit` customers by total spend - quantity * unit price
    // summed over every line of every order they have placed - highest first,
    // name ascending to break ties. Customers with no orders count as 0 and
    // still appear. limit defaults to 3; limit < 1 is 400.
    //
    // The whole thing has to be one SQL command.
    private static Task<IResult> TopCustomers(int? limit, OrdersDb db) =>
        throw new NotImplementedException("challenge: GET /l06/customers/top is not implemented yet - edit src/Api/L06_EfcoreRelationships/Challenge.cs");
}
