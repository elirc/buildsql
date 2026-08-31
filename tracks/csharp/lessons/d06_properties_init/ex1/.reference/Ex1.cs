// d06_properties_init / ex1 - a private setter and two computed properties.
// See lessons/d06_properties_init/README.md, "Exercise 1".

namespace CSharpDojo.D06_PropertiesInit;

public class Battery
{
    /// <summary>A capacity of 1 or more; anything else is ArgumentOutOfRangeException.</summary>
    public Battery(int capacityMah)
    {
        if (capacityMah < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(capacityMah), "A battery holds something.");
        }

        CapacityMah = capacityMah;
    }

    public int CapacityMah { get; }

    /// <summary>How much charge is in it now. Only this class may change it.</summary>
    public int ChargeMah { get; private set; }

    /// <summary>
    /// The charge as a whole-number percentage of capacity, rounded to nearest
    /// with halves away from zero.
    /// </summary>
    public int Percent =>
        (int)Math.Round(ChargeMah * 100.0 / CapacityMah, MidpointRounding.AwayFromZero);

    /// <summary>True when the charge has reached capacity.</summary>
    public bool IsFull => ChargeMah == CapacityMah;

    /// <summary>
    /// Add charge, stopping at capacity. A negative amount is
    /// ArgumentOutOfRangeException.
    /// </summary>
    public void Charge(int mah)
    {
        if (mah < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(mah), "Charging takes a positive amount.");
        }

        ChargeMah = Math.Min(CapacityMah, ChargeMah + mah);
    }

    /// <summary>
    /// Take charge away, stopping at zero. A negative amount is
    /// ArgumentOutOfRangeException.
    /// </summary>
    public void Drain(int mah)
    {
        if (mah < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(mah), "Draining takes a positive amount.");
        }

        ChargeMah = Math.Max(0, ChargeMah - mah);
    }
}
