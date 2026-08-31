// d06_properties_init / ex1 - a private setter and two computed properties.
// See lessons/d06_properties_init/README.md, "Exercise 1".

namespace CSharpDojo.D06_PropertiesInit;

public class Battery
{
    /// <summary>A capacity of 1 or more; anything else is ArgumentOutOfRangeException.</summary>
    public Battery(int capacityMah)
    {
        throw new NotImplementedException("ex1: the Battery constructor is not implemented yet - edit this file.");
    }

    public int CapacityMah { get; }

    /// <summary>How much charge is in it now. Only this class may change it.</summary>
    public int ChargeMah { get; private set; }

    /// <summary>
    /// The charge as a whole-number percentage of capacity, rounded to nearest
    /// with halves away from zero.
    /// </summary>
    public int Percent => throw new NotImplementedException("ex1: Percent is not implemented yet - edit this file.");

    /// <summary>True when the charge has reached capacity.</summary>
    public bool IsFull => throw new NotImplementedException("ex1: IsFull is not implemented yet - edit this file.");

    /// <summary>
    /// Add charge, stopping at capacity. A negative amount is
    /// ArgumentOutOfRangeException.
    /// </summary>
    public void Charge(int mah)
    {
        throw new NotImplementedException("ex1: Charge is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Take charge away, stopping at zero. A negative amount is
    /// ArgumentOutOfRangeException.
    /// </summary>
    public void Drain(int mah)
    {
        throw new NotImplementedException("ex1: Drain is not implemented yet - edit this file.");
    }
}
