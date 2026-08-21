// 01_types_variables / challenge - parse a text line, do decimal maths, format it back.
// See lessons/01_types_variables/README.md, "Challenge".

using System.Globalization;

namespace CSharpDojo.L01_TypesVariables;

public static class ReceiptLine
{
    /// <summary>
    /// "widget|19.99|3" -> "widget x3 = $59.97".
    /// The three fields are name, unit price and quantity, pipe-separated.
    /// </summary>
    public static string Format(string line)
    {
        string[] fields = line.Split('|');
        string name = fields[0];
        decimal unitPrice = decimal.Parse(fields[1], CultureInfo.InvariantCulture);
        int quantity = int.Parse(fields[2], CultureInfo.InvariantCulture);

        decimal total = Math.Round(unitPrice * quantity, 2, MidpointRounding.AwayFromZero);
        return $"{name} x{quantity} = ${total.ToString("0.00", CultureInfo.InvariantCulture)}";
    }
}
