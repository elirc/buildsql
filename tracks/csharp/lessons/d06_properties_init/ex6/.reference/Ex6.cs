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
        get => _value;
        set
        {
            if (value is null || value.Length < 8)
            {
                throw new ArgumentException("A password is at least 8 characters.", nameof(value));
            }

            _value = value;
        }
    }

    /// <summary>
    /// A score from 0 to 4: one point each for being 12 characters or longer,
    /// containing a digit, containing an upper-case letter, and containing a
    /// character that is neither a letter nor a digit.
    /// </summary>
    public int Strength
    {
        get
        {
            int score = 0;
            if (_value.Length >= 12)
            {
                score++;
            }

            if (_value.Any(char.IsDigit))
            {
                score++;
            }

            if (_value.Any(char.IsUpper))
            {
                score++;
            }

            if (_value.Any(c => !char.IsLetterOrDigit(c)))
            {
                score++;
            }

            return score;
        }
    }

    /// <summary>True when the strength is 3 or more.</summary>
    public bool IsStrong => Strength >= 3;
}
