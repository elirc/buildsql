// d08_polymorphism / ex1 - one loop, several implementations.
// See lessons/d08_polymorphism/README.md, "Exercise 1".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Exporter
{
    /// <summary>"csv", "json" - no dot.</summary>
    public abstract string Extension { get; }

    /// <summary>Turn the rows into one string.</summary>
    public abstract string Export(IReadOnlyList<string> rows);
}

public class CsvExporter : Exporter
{
    /// <summary>"csv".</summary>
    public override string Extension => "csv";

    /// <summary>The rows joined with commas.</summary>
    public override string Export(IReadOnlyList<string> rows) => string.Join(",", rows);
}

public class JsonExporter : Exporter
{
    /// <summary>"json".</summary>
    public override string Extension => "json";

    /// <summary>The rows as a JSON array of quoted strings: ["a","b"].</summary>
    public override string Export(IReadOnlyList<string> rows) =>
        "[" + string.Join(",", rows.Select(row => $"\"{row}\"")) + "]";
}

public static class Exporters
{
    /// <summary>
    /// "csv=a,b|json=[\"a\",\"b\"]" - for each exporter in order, its extension,
    /// "=", and what it exported, joined with "|".
    /// One loop, no type tests.
    /// </summary>
    public static string ExportAll(IEnumerable<Exporter> exporters, IReadOnlyList<string> rows)
    {
        List<string> parts = new List<string>();
        foreach (Exporter exporter in exporters)
        {
            parts.Add($"{exporter.Extension}={exporter.Export(rows)}");
        }

        return string.Join("|", parts);
    }
}
