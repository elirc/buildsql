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
        if (width < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(width), "A box has a positive width.");
        }

        if (height < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(height), "A box has a positive height.");
        }

        if (depth < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(depth), "A box has a positive depth.");
        }

        Width = width;
        Height = height;
        Depth = depth;
    }

    /// <summary>
    /// A cube. This constructor must DELEGATE to the one above with `: this(...)`
    /// rather than repeating the assignments or the validation.
    /// </summary>
    public Box(int side)
        : this(side, side, side)
    {
    }

    public int Width { get; }

    public int Height { get; }

    public int Depth { get; }

    /// <summary>Width times height times depth.</summary>
    public int Volume => Width * Height * Depth;

    /// <summary>True when all three dimensions are the same.</summary>
    public bool IsCube => Width == Height && Height == Depth;
}
