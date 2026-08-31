// d24_mixed_gauntlet / ex8 - a small repository that uses most of the track.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 8".

using System.Globalization;

namespace CSharpDojo.D24_MixedGauntlet;

// The gate builds these. Written for you.
public record Employee(int Id, string Name, string Dept, decimal Salary);

public sealed class Repository
{
    private readonly Dictionary<int, Employee> _byId = new Dictionary<int, Employee>();
    private readonly List<int> _order = new List<int>();

    /// <summary>Raised after every successful Save, with the saved employee.</summary>
    public event Action<Employee>? Saved;

    /// <summary>Written for you: how many handlers are listening.</summary>
    public int Listeners => Saved?.GetInvocationList().Length ?? 0;

    public int Count => _byId.Count;

    /// <summary>
    /// Adds the employee, or replaces the one with the same Id - in which case
    /// its position in the insertion order does not change. Raises Saved
    /// afterwards either way.
    /// </summary>
    public void Save(Employee employee)
    {
        throw new NotImplementedException("ex8: Save is not implemented yet - edit this file.");
    }

    /// <summary>The employee with that Id; KeyNotFoundException when there is none.</summary>
    public Employee Get(int id)
    {
        throw new NotImplementedException("ex8: Get is not implemented yet - edit this file.");
    }

    /// <summary>Removes one; true when there was one to remove.</summary>
    public bool Remove(int id)
    {
        throw new NotImplementedException("ex8: Remove is not implemented yet - edit this file.");
    }

    /// <summary>The matching employees, in insertion order.</summary>
    public List<Employee> Query(Func<Employee, bool> predicate)
    {
        throw new NotImplementedException("ex8: Query is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "eng=150" for each department, using the invariant culture, ordered by
    /// department (ordinal).
    /// </summary>
    public List<string> DeptTotals()
    {
        throw new NotImplementedException("ex8: DeptTotals is not implemented yet - edit this file.");
    }
}
