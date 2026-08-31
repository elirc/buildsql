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
        if (!_byId.ContainsKey(employee.Id))
        {
            _order.Add(employee.Id);
        }

        _byId[employee.Id] = employee;
        Saved?.Invoke(employee);
    }

    /// <summary>The employee with that Id; KeyNotFoundException when there is none.</summary>
    public Employee Get(int id)
    {
        if (!_byId.TryGetValue(id, out Employee? employee))
        {
            throw new KeyNotFoundException($"no employee with id {id}");
        }

        return employee;
    }

    /// <summary>Removes one; true when there was one to remove.</summary>
    public bool Remove(int id)
    {
        if (!_byId.Remove(id))
        {
            return false;
        }

        _order.Remove(id);
        return true;
    }

    /// <summary>The matching employees, in insertion order.</summary>
    public List<Employee> Query(Func<Employee, bool> predicate)
    {
        return _order.Select(id => _byId[id]).Where(predicate).ToList();
    }

    /// <summary>
    /// "eng=150" for each department, using the invariant culture, ordered by
    /// department (ordinal).
    /// </summary>
    public List<string> DeptTotals()
    {
        return _order
            .Select(id => _byId[id])
            .GroupBy(employee => employee.Dept)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group =>
                $"{group.Key}={group.Sum(employee => employee.Salary).ToString(CultureInfo.InvariantCulture)}")
            .ToList();
    }
}
