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
        if (opening < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(opening), "Stock does not start negative.");
        }

        _units = opening;
    }

    /// <summary>How many units are on the shelf.</summary>
    public int Units => _units;

    /// <summary>Add units. A negative amount is ArgumentOutOfRangeException.</summary>
    protected void Increase(int amount)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Increase takes a positive amount.");
        }

        _units += amount;
    }

    /// <summary>
    /// Take units away. False - and no change - when there are not enough.
    /// A negative amount is ArgumentOutOfRangeException.
    /// </summary>
    protected bool Decrease(int amount)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Decrease takes a positive amount.");
        }

        if (amount > _units)
        {
            return false;
        }

        _units -= amount;
        return true;
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
        Increase(amount);
        Movements++;
    }

    /// <summary>
    /// Send units out. False when there is not enough stock - and a refused
    /// shipment is not a movement.
    /// </summary>
    public bool Ship(int amount)
    {
        if (!Decrease(amount))
        {
            return false;
        }

        Movements++;
        return true;
    }
}
