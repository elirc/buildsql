// 01_routing_endpoints - given code, not an exercise. Do not edit.
//
// A tiny read-only dataset so this lesson can be about routing and result
// types without a database in the way. Lesson 05 replaces it with EF Core.

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public record Order(int Id, string Customer, string Status, int TotalCents);

public record Product(string Sku, string Name, int PriceCents);

public record NewOrder(string? Customer, int TotalCents);

public record StatusChange(string? Status);

public static class Catalog
{
    public static readonly string[] Statuses = ["pending", "shipped", "cancelled"];

    public static readonly IReadOnlyList<Order> Orders =
    [
        new(1, "Ada", "shipped", 4200),
        new(2, "Grace", "pending", 1999),
        new(3, "Ada", "shipped", 15000),
        new(4, "Linus", "cancelled", 800),
        new(5, "Grace", "shipped", 2500),
    ];

    public static readonly IReadOnlyList<Product> Products =
    [
        new("dojo-01", "Rice paper lamp", 3400),
        new("dojo-02", "Tatami mat", 12500),
        new("dojo-03", "Bokken", 5900),
    ];

    /// <summary>The id a newly created order would get. Nothing is persisted in this lesson.</summary>
    public static int NextOrderId => Orders.Max(o => o.Id) + 1;
}
