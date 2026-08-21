// 04_inheritance_polymorphism / review1 - abstract member, virtual member, one base.
// See lessons/04_inheritance_polymorphism/README.md, "Review".

namespace CSharpDojo.L04_InheritancePolymorphism;

public abstract class Vehicle
{
    protected Vehicle(string name)
    {
        Name = name;
    }

    public string Name { get; }

    /// <summary>Every vehicle has some number of wheels; there is no sensible default.</summary>
    public abstract int Wheels { get; }

    /// <summary>Most vehicles go "vroom". Some do not.</summary>
    public virtual string Sound() => "vroom";

    /// <summary>Written for you: note that it calls the two members above.</summary>
    public string Describe() => $"{Name}: {Wheels} wheels, {Sound()}";
}

public class Car : Vehicle
{
    public Car(string name)
        : base(name)
    {
    }

    public override int Wheels => 4;
}

public class Motorbike : Vehicle
{
    public Motorbike(string name)
        : base(name)
    {
    }

    public override int Wheels => 2;

    /// <summary>A motorbike says "brap". Replace the inherited version.</summary>
    public override string Sound() => "brap";
}
