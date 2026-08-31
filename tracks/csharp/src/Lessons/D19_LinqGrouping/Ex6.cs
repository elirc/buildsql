// d19_linq_grouping / ex6 - the GroupBy overloads that save you a step.
// See lessons/d19_linq_grouping/README.md, "Exercise 6".

namespace CSharpDojo.D19_LinqGrouping;

// The gate builds these. Written for you.
public record Employee(string Name, string Department, int Level);

public static class Shapes
{
    /// <summary>
    /// "eng:ada,bob" for each department, ordered by department (ordinal),
    /// with the names inside in input order. Uses the GroupBy overload that
    /// takes an element selector, so each group holds names rather than
    /// employees.
    /// </summary>
    public static List<string> NamesByDepartment(IEnumerable<Employee> staff)
    {
        throw new NotImplementedException("ex6: NamesByDepartment is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "eng=2" for each department, ordered by department (ordinal). Uses the
    /// GroupBy overload that takes a result selector, so no group object is
    /// ever handed back.
    /// </summary>
    public static List<string> HeadcountByDepartment(IEnumerable<Employee> staff)
    {
        throw new NotImplementedException("ex6: HeadcountByDepartment is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The highest level in each department, as "eng=5", ordered by department
    /// (ordinal).
    /// </summary>
    public static List<string> TopLevelByDepartment(IEnumerable<Employee> staff)
    {
        throw new NotImplementedException("ex6: TopLevelByDepartment is not implemented yet - edit this file.");
    }
}
