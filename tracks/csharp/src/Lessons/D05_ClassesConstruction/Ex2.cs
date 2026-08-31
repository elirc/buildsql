// d05_classes_construction / ex2 - one constructor calling another.
// See lessons/d05_classes_construction/README.md, "Exercise 2".

namespace CSharpDojo.D05_ClassesConstruction;

public class Box
{
    /// <summary>
    /// The full constructor. Any dimension below 1 throws
    /// ArgumentOutOfRangeException naming that dimension.
    /// </summary>
    public Box(int width, int height, int depth)
    {
        throw new NotImplementedException("ex2: the three-argument Box constructor is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A cube. This constructor must DELEGATE to the one above with `: this(...)`
    /// rather than repeating the assignments or the validation.
    /// </summary>
    public Box(int side)
    {
        throw new NotImplementedException("ex2: the one-argument Box constructor is not implemented yet - edit this file.");
    }

    public int Width { get; }

    public int Height { get; }

    public int Depth { get; }

    /// <summary>Width times height times depth.</summary>
    public int Volume => throw new NotImplementedException("ex2: Volume is not implemented yet - edit this file.");

    /// <summary>True when all three dimensions are the same.</summary>
    public bool IsCube => throw new NotImplementedException("ex2: IsCube is not implemented yet - edit this file.");
}
