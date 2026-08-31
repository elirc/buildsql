// d10_records_structs / ex1 - what one line of `record` gives you.
// See lessons/d10_records_structs/README.md, "Exercise 1".

namespace CSharpDojo.D10_RecordsStructs;

// Declare the positional record here. It needs three components, in this
// order: Name (string), Department (string), Level (int).
public record Employee(string Name, string Department, int Level);

public static class Staff
{
    /// <summary>
    /// "Ada works in Eng at level 3" - built by DECONSTRUCTING the record into
    /// three variables rather than reading three properties.
    /// </summary>
    public static string Describe(Employee employee)
    {
        (string name, string department, int level) = employee;
        return $"{name} works in {department} at level {level}";
    }

    /// <summary>The record's own generated ToString, unchanged.</summary>
    public static string Print(Employee employee) => employee.ToString();

    /// <summary>
    /// True when the two employees hold the same data. Use the record's own
    /// equality - do not compare the properties one by one.
    /// </summary>
    public static bool SamePerson(Employee a, Employee b) => a == b;
}
