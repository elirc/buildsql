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
        return staff
            .GroupBy(employee => employee.Department, employee => employee.Name)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => $"{group.Key}:{string.Join(",", group)}")
            .ToList();
    }

    /// <summary>
    /// "eng=2" for each department, ordered by department (ordinal). Uses the
    /// GroupBy overload that takes a result selector, so no group object is
    /// ever handed back.
    /// </summary>
    public static List<string> HeadcountByDepartment(IEnumerable<Employee> staff)
    {
        return staff
            .GroupBy(
                employee => employee.Department,
                (department, members) => new { Department = department, Count = members.Count() })
            .OrderBy(row => row.Department, StringComparer.Ordinal)
            .Select(row => $"{row.Department}={row.Count}")
            .ToList();
    }

    /// <summary>
    /// The highest level in each department, as "eng=5", ordered by department
    /// (ordinal).
    /// </summary>
    public static List<string> TopLevelByDepartment(IEnumerable<Employee> staff)
    {
        return staff
            .GroupBy(employee => employee.Department)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => $"{group.Key}={group.Max(employee => employee.Level)}")
            .ToList();
    }
}
