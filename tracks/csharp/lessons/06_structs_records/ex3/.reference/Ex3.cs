// 06_structs_records / ex3 - with-expressions: change one thing, keep the rest.
// See lessons/06_structs_records/README.md, "Exercise 3".

namespace CSharpDojo.L06_StructsRecords;

public record Order(string Sku, int Quantity, decimal UnitPrice, string Status = "new");

public static class Orders
{
    /// <summary>A copy of the order at a different unit price. Nothing else changes.</summary>
    public static Order Reprice(Order order, decimal newUnitPrice)
    {
        return order with { UnitPrice = newUnitPrice };
    }

    /// <summary>A copy with one more unit AND the status set to "amended".</summary>
    public static Order AddOneUnit(Order order)
    {
        return order with { Quantity = order.Quantity + 1, Status = "amended" };
    }

    /// <summary>
    /// True when the two orders differ only in status - same sku, quantity and
    /// price. Do it by making one comparable to the other, not by comparing
    /// three properties by hand.
    /// </summary>
    public static bool DiffersOnlyInStatus(Order a, Order b)
    {
        return a with { Status = b.Status } == b;
    }
}
