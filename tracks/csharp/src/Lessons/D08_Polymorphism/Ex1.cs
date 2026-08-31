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
    public override string Extension =>
        throw new NotImplementedException("ex1: CsvExporter.Extension is not implemented yet - edit this file.");

    /// <summary>The rows joined with commas.</summary>
    public override string Export(IReadOnlyList<string> rows)
    {
        throw new NotImplementedException("ex1: CsvExporter.Export is not implemented yet - edit this file.");
    }
}

public class JsonExporter : Exporter
{
    /// <summary>"json".</summary>
    public override string Extension =>
        throw new NotImplementedException("ex1: JsonExporter.Extension is not implemented yet - edit this file.");

    /// <summary>The rows as a JSON array of quoted strings: ["a","b"].</summary>
    public override string Export(IReadOnlyList<string> rows)
    {
        throw new NotImplementedException("ex1: JsonExporter.Export is not implemented yet - edit this file.");
    }
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
        throw new NotImplementedException("ex1: ExportAll is not implemented yet - edit this file.");
    }
}
