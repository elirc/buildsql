// 06_efcore_relationships / ex3 - the N+1, and the projection that kills it.
// See lessons/06_efcore_relationships/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/orders/summary", Summary);
    }

    // 200 with one OrderTotals per order, id ascending: the order id, the
    // customer's name, how many lines it has, and quantity * unit price summed
    // over those lines.
    //
    // The answers below are correct. The gate fails this anyway - read it, then
    // read the README.
    private static async Task<IResult> Summary(OrdersDb db)
    {
        var orders = await db.Orders.OrderBy(o => o.Id).ToListAsync();
        var summaries = new List<OrderTotals>();

        foreach (var order in orders)
        {
            var customer = await db.Customers.FirstAsync(c => c.Id == order.CustomerId);
            var lines = await db.OrderLines.Where(l => l.OrderId == order.Id).ToListAsync();

            summaries.Add(new OrderTotals(
                order.Id,
                customer.Name,
                lines.Count,
                lines.Sum(l => l.Quantity * l.UnitPriceCents)));
        }

        return TypedResults.Ok(summaries);
    }
}
