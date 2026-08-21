// 06_efcore_relationships / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l06/customers/{id:int}", GetCustomer);
    }

    private static async Task<IResult> GetCustomer(int id, OrdersDb db)
    {
        var customer = await db.Customers
            .Include(c => c.Orders)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer is null)
        {
            return TypedResults.NotFound();
        }

        var orders = customer.Orders
            .OrderBy(o => o.Id)
            .Select(o => new OrderSummary(o.Id, o.Reference))
            .ToList();

        return TypedResults.Ok(new CustomerDetail(customer.Id, customer.Name, orders));
    }
}
