// 04_inheritance_polymorphism / ex3 - override versus new, and who decides.
// See lessons/04_inheritance_polymorphism/README.md, "Exercise 3".
//
// Both Speak methods below are missing a modifier. Adding the RIGHT one to each
// is the exercise; the compiler will warn you about the one you leave bare.

namespace CSharpDojo.L04_InheritancePolymorphism;

public class Duck
{
    public virtual string Speak() => "quack";
}

/// <summary>Overrides Speak, so every caller hears the loud version.</summary>
public class LoudDuck : Duck
{
    public override string Speak()
    {
        return "QUACK";
    }
}

/// <summary>
/// HIDES Speak instead of overriding it, so only callers who know they are
/// holding a SneakyDuck hear the new version.
/// </summary>
public class SneakyDuck : Duck
{
    public new string Speak()
    {
        return "shh";
    }
}
