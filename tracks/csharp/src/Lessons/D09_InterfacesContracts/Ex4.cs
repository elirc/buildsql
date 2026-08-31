// d09_interfaces_contracts / ex4 - explicit implementation hides a member.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 4".

namespace CSharpDojo.D09_InterfacesContracts;

/// <summary>The contract the persistence layer uses. Not for ordinary callers.</summary>
public interface IPersistable
{
    string ToRow();

    int Version { get; }
}

public class Customer : IPersistable
{
    public Customer(string name, string email)
    {
        Name = name;
        Email = email;
    }

    public string Name { get; }

    public string Email { get; }

    /// <summary>The ordinary, public description: "Ada &lt;ada@x&gt;".</summary>
    public string Describe()
    {
        throw new NotImplementedException("ex4: Describe is not implemented yet - edit this file.");
    }

    // Both interface members below must be implemented EXPLICITLY -
    // `string IPersistable.ToRow()` - so they do not appear on Customer's own
    // surface and can only be reached through an IPersistable reference.

    string IPersistable.ToRow()
    {
        throw new NotImplementedException("ex4: ToRow is not implemented yet - edit this file.");
    }

    int IPersistable.Version =>
        throw new NotImplementedException("ex4: Version is not implemented yet - edit this file.");
}

public static class Persistence
{
    /// <summary>"2|Ada|ada@x" - the version, then the row.</summary>
    public static string Save(IPersistable item)
    {
        throw new NotImplementedException("ex4: Save is not implemented yet - edit this file.");
    }
}
