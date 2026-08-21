// 03_classes_objects / ex1 - a constructor, a private setter, and an invariant.
// See lessons/03_classes_objects/README.md, "Exercise 1".

namespace CSharpDojo.L03_ClassesObjects;

public class Account
{
    /// <summary>A new account belongs to someone and holds nothing.</summary>
    public Account(string owner)
    {
        Owner = owner;
        Balance = 0m;
    }

    /// <summary>Set once, by the constructor. There is no setter at all.</summary>
    public string Owner { get; } = "";

    /// <summary>Anyone may read it; only this class may change it.</summary>
    public decimal Balance { get; private set; }

    /// <summary>Add money. A deposit of zero or less is an ArgumentOutOfRangeException.</summary>
    public void Deposit(decimal amount)
    {
        if (amount <= 0m)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), amount, "A deposit must be positive.");
        }

        Balance += amount;
    }

    /// <summary>
    /// Take money out, but never past zero: if the balance cannot cover it,
    /// change nothing and return false.
    /// </summary>
    public bool Withdraw(decimal amount)
    {
        if (amount <= 0m)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), amount, "A withdrawal must be positive.");
        }

        if (amount > Balance)
        {
            return false;
        }

        Balance -= amount;
        return true;
    }
}
