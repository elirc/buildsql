// 11_linq_2 / ex3 - SelectMany: one row in, many rows out.
// See lessons/11_linq_2/README.md, "Exercise 3".

namespace CSharpDojo.L11_Linq2;

public static class Flatten
{
    /// <summary>
    /// Every item of every shipment, in order, as one flat sequence. A
    /// shipment with no items contributes nothing.
    /// </summary>
    public static List<string> AllItems(IEnumerable<Shipment> shipments)
    {
        return shipments.SelectMany(shipment => shipment.Items).ToList();
    }

    /// <summary>
    /// The same flattening, but each item labelled with the shipment it came
    /// from: "A:hat". The pairing is what SelectMany's second argument is for.
    /// </summary>
    public static List<string> LabelledItems(IEnumerable<Shipment> shipments)
    {
        return shipments
            .SelectMany(shipment => shipment.Items, (shipment, item) => $"{shipment.Code}:{item}")
            .ToList();
    }
}
