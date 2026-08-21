// 01_types_variables / ex4 - decimal money maths and honest rounding.
// See lessons/01_types_variables/README.md, "Exercise 4".

namespace CSharpDojo.L01_TypesVariables;

public static class Money
{
    /// <summary>
    /// unitPrice x quantity, less discountPercent percent, rounded to 2 decimal
    /// places with halves going away from zero.
    /// </summary>
    public static decimal LineTotal(decimal unitPrice, int quantity, decimal discountPercent)
    {
        decimal gross = unitPrice * quantity;
        decimal net = gross - (gross * discountPercent / 100m);
        return Math.Round(net, 2, MidpointRounding.AwayFromZero);
    }
}
