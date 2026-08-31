// d07_inheritance / ex5 - protected is for your children, private is not.
// See lessons/d07_inheritance/README.md, "Exercise 5".

namespace CSharpDojo.D07_Inheritance;

public class Stock
{
    // PRIVATE: even a derived class cannot touch this directly. Everything
    // that changes it goes through the two protected methods below.
    private int _units;

    public Stock(int opening)
    {
        throw new NotImplementedException("ex5: the Stock constructor is not implemented yet - edit this file.");
    }

    /// <summary>How many units are on the shelf.</summary>
    public int Units => throw new NotImplementedException("ex5: Units is not implemented yet - edit this file.");

    /// <summary>Add units. A negative amount is ArgumentOutOfRangeException.</summary>
    protected void Increase(int amount)
    {
        throw new NotImplementedException("ex5: Increase is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Take units away. False - and no change - when there are not enough.
    /// A negative amount is ArgumentOutOfRangeException.
    /// </summary>
    protected bool Decrease(int amount)
    {
        throw new NotImplementedException("ex5: Decrease is not implemented yet - edit this file.");
    }
}

public class AuditedStock : Stock
{
    public AuditedStock(int opening)
        : base(opening)
    {
    }

    /// <summary>How many movements actually changed the stock.</summary>
    public int Movements { get; private set; }

    /// <summary>Take a delivery in.</summary>
    public void Receive(int amount)
    {
        throw new NotImplementedException("ex5: Receive is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Send units out. False when there is not enough stock - and a refused
    /// shipment is not a movement.
    /// </summary>
    public bool Ship(int amount)
    {
        throw new NotImplementedException("ex5: Ship is not implemented yet - edit this file.");
    }
}
