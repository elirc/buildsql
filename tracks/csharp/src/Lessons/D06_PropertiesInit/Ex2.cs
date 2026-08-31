// d06_properties_init / ex2 - init-only properties and object initialisers.
// See lessons/d06_properties_init/README.md, "Exercise 2".

namespace CSharpDojo.D06_PropertiesInit;

public class Invoice
{
    /// <summary>Settable only in an object initialiser.</summary>
    public string Number { get; init; } = "";

    /// <summary>The amount before tax.</summary>
    public decimal Subtotal { get; init; }

    /// <summary>The tax rate as a fraction - 0.2m is 20%.</summary>
    public decimal TaxRate { get; init; }

    /// <summary>
    /// Subtotal times rate, rounded to 2 decimal places with halves away from
    /// zero. Computed, never stored.
    /// </summary>
    public decimal Tax => throw new NotImplementedException("ex2: Tax is not implemented yet - edit this file.");

    /// <summary>Subtotal plus tax.</summary>
    public decimal Total => throw new NotImplementedException("ex2: Total is not implemented yet - edit this file.");

    /// <summary>"INV-1: 120.00" - the number, a colon, a space, and the total.</summary>
    public string Label => throw new NotImplementedException("ex2: Label is not implemented yet - edit this file.");
}
