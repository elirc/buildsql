// 05_interfaces / ex2 - two interfaces, one name, explicit implementation.
// See lessons/05_interfaces/README.md, "Exercise 2".

namespace CSharpDojo.L05_Interfaces;

public interface IEnglish
{
    string Greet();
}

public interface IFrench
{
    string Greet();
}

/// <summary>
/// One method cannot return two different greetings. Replace the single public
/// Greet below with two EXPLICIT implementations, one per interface.
/// </summary>
public class Bilingual : IEnglish, IFrench
{
    public string Greet()
    {
        throw new NotImplementedException("ex2: Bilingual needs two explicit Greet implementations - edit this file.");
    }
}
