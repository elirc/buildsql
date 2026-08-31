// d06_properties_init / ex6 - a setter that refuses, and a score that follows.
// See lessons/d06_properties_init/README.md, "Exercise 6".

namespace CSharpDojo.D06_PropertiesInit;

public class Password
{
    private string _value = "";

    /// <summary>
    /// The password. A null value or one shorter than 8 characters is an
    /// ArgumentException, and a rejected assignment must leave the previous
    /// value in place.
    /// </summary>
    public string Value
    {
        get => throw new NotImplementedException("ex6: the Value getter is not implemented yet - edit this file.");
        set => throw new NotImplementedException("ex6: the Value setter is not implemented yet - edit this file.");
    }

    /// <summary>
    /// A score from 0 to 4: one point each for being 12 characters or longer,
    /// containing a digit, containing an upper-case letter, and containing a
    /// character that is neither a letter nor a digit.
    /// </summary>
    public int Strength => throw new NotImplementedException("ex6: Strength is not implemented yet - edit this file.");

    /// <summary>True when the strength is 3 or more.</summary>
    public bool IsStrong => throw new NotImplementedException("ex6: IsStrong is not implemented yet - edit this file.");
}
