// d10_records_structs / ex8 - nested records, `with`, and positional patterns.
// See lessons/d10_records_structs/README.md, "Exercise 8".

namespace CSharpDojo.D10_RecordsStructs;

public record Address(string City, string Country);

public record Person(string Name, Address Home);

public static class People
{
    /// <summary>
    /// A copy of the person living in a different city. `with` copies the
    /// Address REFERENCE, so the nested record has to be rebuilt too.
    /// </summary>
    public static Person MoveCity(Person person, string city) =>
        person with { Home = person.Home with { City = city } };

    /// <summary>
    /// True when both people live in the same country. Use a positional pattern
    /// rather than reading the properties.
    /// </summary>
    public static bool SameCountry(Person a, Person b)
    {
        return a is Person(_, Address(_, string countryA))
            && b is Person(_, Address(_, string countryB))
            && countryA == countryB;
    }

    /// <summary>
    /// One switch expression over nested positional patterns, in this order:
    /// anyone whose country is "UK"                -> "UK"
    /// anyone living in "Paris", "France"          -> "Parisian"
    /// anyone whose name is longer than 8 letters  -> "long name"
    /// everyone else                               -> "other"
    /// </summary>
    public static string Classify(Person person) => person switch
    {
        Person(_, Address(_, "UK")) => "UK",
        Person(_, Address("Paris", "France")) => "Parisian",
        Person(var name, _) when name.Length > 8 => "long name",
        _ => "other",
    };
}
