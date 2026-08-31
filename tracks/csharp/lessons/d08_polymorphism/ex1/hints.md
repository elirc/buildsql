## Hint 1

`ExportAll` is one `foreach` over `IEnumerable<Exporter>`. It never asks what
kind of exporter it has - it just reads `Extension` and calls `Export`, and the
right implementation runs because both members are abstract.

If you find yourself writing `if (exporter is CsvExporter)`, stop: that is the
code polymorphism exists to delete.

## Hint 2

```csharp
foreach (Exporter exporter in exporters)
    parts.Add($"{exporter.Extension}={exporter.Export(rows)}");
return string.Join("|", parts);
```

The JSON exporter needs each row wrapped in quotes:

```csharp
"[" + string.Join(",", rows.Select(row => $"\"{row}\"")) + "]"
```

The empty-rows case falls out of that without a special branch, because
`string.Join` over nothing gives `""` and you are left with `"[]"`. (Real JSON
would also need escaping for quotes inside a row - worth saying out loud that
you know, and that this is a drill rather than a serialiser.)
