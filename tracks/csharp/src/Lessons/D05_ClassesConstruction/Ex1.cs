// d05_classes_construction / ex1 - a constructor that refuses bad state.
// See lessons/d05_classes_construction/README.md, "Exercise 1".

namespace CSharpDojo.D05_ClassesConstruction;

public class Ticket
{
    /// <summary>
    /// A code that is null, empty or blank is an ArgumentException; a seat
    /// count below 1 is an ArgumentOutOfRangeException. The code is stored
    /// trimmed and upper-cased with the invariant culture.
    /// </summary>
    public Ticket(string code, int seats)
    {
        throw new NotImplementedException("ex1: the Ticket constructor is not implemented yet - edit this file.");
    }

    /// <summary>The normalised code. Set once, by the constructor.</summary>
    public string Code { get; } = "";

    /// <summary>How many seats this ticket covers. At least 1.</summary>
    public int Seats { get; }

    /// <summary>"CODE x2" - the code, a space, an "x", then the seat count.</summary>
    public string Describe()
    {
        throw new NotImplementedException("ex1: Describe is not implemented yet - edit this file.");
    }
}
