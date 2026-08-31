## Hint 1

`init` is a setter that may only run during object construction - inside an
object initialiser or a constructor. Afterwards the property is read-only, so
you get immutability without writing a constructor with five parameters.

The three properties you have to write are all computed. None of them stores
anything.

## Hint 2

```csharp
public decimal Tax => Math.Round(Subtotal * TaxRate, 2, MidpointRounding.AwayFromZero);
public decimal Total => Subtotal + Tax;
```

`Total` reading `Tax` rather than recomputing the multiplication is the detail
the gate checks: the total has to use the *rounded* tax, or the invoice's own
lines do not add up to its own total.

For `Label`, remember that rounding and formatting are different jobs.
`Total.ToString("0.00", CultureInfo.InvariantCulture)` presents two decimals
whatever the value is; it is not what makes the arithmetic correct.

Note the `= ""` on `Number`. Without it, a non-nullable `string` property with
no initialiser draws a nullable warning, because nothing forces a caller to set
it - which is exactly the problem `required` solves in ex3.
