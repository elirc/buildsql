// 01_types_variables / ex3 - nullable annotations, ?? and the empty-string case.
// See lessons/01_types_variables/README.md, "Exercise 3".

namespace CSharpDojo.L01_TypesVariables;

public static class Labels
{
    /// <summary>
    /// "Ada (36)" - but a missing or blank name becomes "anonymous", and a
    /// missing age becomes "age unknown".
    /// </summary>
    public static string Describe(string? name, int? age)
    {
        string who = string.IsNullOrWhiteSpace(name) ? "anonymous" : name;
        string years = age.HasValue ? age.Value.ToString() : "age unknown";
        return $"{who} ({years})";
    }
}
