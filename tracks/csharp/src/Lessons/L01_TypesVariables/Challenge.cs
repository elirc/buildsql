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
        throw new NotImplementedException("challenge: Format is not implemented yet - edit this file.");
    }
}
