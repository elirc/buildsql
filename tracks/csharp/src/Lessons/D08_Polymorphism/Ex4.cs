// d08_polymorphism / ex4 - virtual dispatch versus a switch over types.
// See lessons/d08_polymorphism/README.md, "Exercise 4".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Container
{
    /// <summary>How many units this container holds.</summary>
    public abstract int Capacity { get; }
}

public class Crate : Container
{
    /// <summary>12.</summary>
    public override int Capacity =>
        throw new NotImplementedException("ex4: Crate.Capacity is not implemented yet - edit this file.");
}

public class Pallet : Container
{
    public Pallet(int crates)
    {
        Crates = crates;
    }

    public int Crates { get; }

    /// <summary>12 per crate.</summary>
    public override int Capacity =>
        throw new NotImplementedException("ex4: Pallet.Capacity is not implemented yet - edit this file.");
}

// Added later, by someone who never read Sizes.
public class Tote : Container
{
    /// <summary>4.</summary>
    public override int Capacity =>
        throw new NotImplementedException("ex4: Tote.Capacity is not implemented yet - edit this file.");
}

public static class Sizes
{
    /// <summary>Ask the container. One line, no type tests, works for every subclass.</summary>
    public static int ByVirtualCall(Container container)
    {
        throw new NotImplementedException("ex4: ByVirtualCall is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The same answer worked out by a switch over the types the author knew
    /// about: 12 for a Crate, 12 per crate for a Pallet, and -1 for anything
    /// else. Write it deliberately WITHOUT a Tote arm - the gate is about what
    /// that costs.
    /// </summary>
    public static int BySwitch(Container container)
    {
        throw new NotImplementedException("ex4: BySwitch is not implemented yet - edit this file.");
    }
}
