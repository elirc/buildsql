// 03_classes_objects / ex1 - a constructor, a private setter, and an invariant.
// See lessons/03_classes_objects/README.md, "Exercise 1".

namespace CSharpDojo.L03_ClassesObjects;

public class Account
{
    /// <summary>A new account belongs to someone and holds nothing.</summary>
    public Account(string owner)
    {
        throw new NotImplementedException("ex1: the Account constructor is not implemented yet - edit this file.");
    }

    /// <summary>Set once, by the constructor. There is no setter at all.</summary>
    public string Owner { get; } = "";

    /// <summary>Anyone may read it; only this class may change it.</summary>
    public decimal Balance { get; private set; }

    /// <summary>Add money. A deposit of zero or less is an ArgumentOutOfRangeException.</summary>
    public void Deposit(decimal amount)
    {
        throw new NotImplementedException("ex1: Deposit is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Take money out, but never past zero: if the balance cannot cover it,
    /// change nothing and return false.
    /// </summary>
    public bool Withdraw(decimal amount)
    {
        throw new NotImplementedException("ex1: Withdraw is not implemented yet - edit this file.");
    }
}
