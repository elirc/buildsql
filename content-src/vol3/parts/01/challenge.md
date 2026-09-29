@@PROMPT@@
## Challenge - a batch under budget

Edit `src/Lessons/V3CC01_GcGenerations/Challenge.cs`. Three ideas from this
sector meet: a rented buffer, span parsing, and a measurement that keeps you
honest.

A batch is one string of records separated by `'\n'`, each record
`"id=<id>;qty=<n>"`:

```
id=a41;qty=5
id=b02;qty=12
id=c19;qty=3
```

Implement:

- `BatchProcessor.Process(ReadOnlySpan<char> batch, Span<char> scratch, out
  int written)` — walks the batch, sums the quantities, writes a normalised
  summary of the form `"a41:5;b02:12;c19:3"` into `scratch`, sets `written` to
  the number of characters used, and returns the total quantity. It allocates
  **nothing**. A record missing either field, or with a quantity that is not a
  non-negative integer, is skipped. If `scratch` is too small it throws
  `ArgumentException` before writing anything partial.
- `BatchProcessor.Run(string batch)` — rents a `char[]` from
  `ArrayPool<char>.Shared` big enough for any summary the batch can produce,
  calls `Process`, and returns
  `BatchReport(int Processed, long TotalQuantity, string Summary, long
  AllocatedBytes, int Gen0Collections)`. `AllocatedBytes` is what the run cost
  on this thread and `Gen0Collections` is the gen0 delta across it.
- `BatchProcessor.RunNaive(string batch)` — the same result computed the
  obvious way: `Split('\n')`, `Split(';')`, `Split('=')`, a `List<string>` and
  `string.Join`. Same `BatchReport` shape.

```
Run("id=a41;qty=5\nid=b02;qty=12")
  -> Processed 2, TotalQuantity 17, Summary "a41:5;b02:12"
Run("id=a41;qty=5\nbroken\nid=c19;qty=x")
  -> Processed 1, TotalQuantity 5, Summary "a41:5"
Run("")   -> Processed 0, TotalQuantity 0, Summary ""
```

Honest difficulty note: the parsing is the easy half. The hard half is
sizing the scratch buffer without allocating to find out, and keeping `Run`'s
own bookkeeping out of the measurement. The gate asserts both implementations
agree on `Processed`, `TotalQuantity` and `Summary`, and that
`Run(...).AllocatedBytes` is at most a third of `RunNaive(...).AllocatedBytes`
on a hundred-record batch.

```
uv run dojo test csharp v3cc01_gc_generations challenge
```
@@HINTS@@
## Hint 1

Do the sizing arithmetic on paper. Every record contributes at most its own
characters to the summary, and the separators only ever get shorter (`;qty=`
becomes `:`), so the batch's own length is a safe upper bound for the scratch
buffer. That is the trick: you never need to count first, because a bound you
can prove is as good as an exact size.

## Hint 2

Writing into a span without a `StringBuilder`:

```csharp
if (!source.TryCopyTo(destination[written..])) throw new ArgumentException(...);
written += source.Length;
destination[written++] = ';';
```

For the number, `qty.TryFormat(destination[written..], out int used)` writes
the digits straight into the buffer with no intermediate string.

## Hint 3

Structure `Run` as: rent, measure, release. Take the allocation and collection
counters immediately before the `Process` call and immediately after the single
`new string(buffer, 0, written)`, so the report covers the parse and its one
deliberate allocation and nothing else. The decision left to you is whether the
`BatchReport` construction itself falls inside the measured window — it is a
record, so it allocates, and being able to say how much your measurement costs
is part of measuring.
@@IMPORTANT@@
## Hint 1

Write `RunNaive` first and measure it. It is ten lines, it is obviously
correct, and it gives you both the expected answers and the number you have to
beat. Optimising before you have a baseline is how people ship faster code that
is wrong.

## Hint 2

Parse each record by finding the two field boundaries rather than splitting:

```csharp
ReadOnlySpan<char> record = ...;             // "id=a41;qty=5"
int semi = record.IndexOf(';');
ReadOnlySpan<char> first = record[..semi];   // "id=a41"
ReadOnlySpan<char> second = record[(semi + 1)..];
```

then check each field's prefix with `StartsWith("id=")` and slice past it.
`int.TryParse(span, out int qty)` accepts a span directly - no substring
needed.

## Hint 3

Skipping is where the two implementations drift apart. Decide precisely what
"skipped" means — not counted in `Processed`, not added to the total, and not
written to the summary — and make sure a skipped record leaves `written`
exactly where it was. The cheapest way to get that right is to build each
record's summary fragment only after both fields have validated.
@@REF@@
// v3cc01_gc_generations / challenge - a batch under budget.
// See lessons/v3cc01_gc_generations/README.md, "Challenge".

using System.Buffers;

namespace CSharpDojo.V3CC01_GcGenerations;

public readonly record struct BatchReport(
    int Processed,
    long TotalQuantity,
    string Summary,
    long AllocatedBytes,
    int Gen0Collections);

public static class BatchProcessor
{
    /// <summary>
    /// Parses the batch and writes "id:qty;id:qty" into scratch. Allocates
    /// nothing: every intermediate value is a view or a stack local.
    /// </summary>
    public static long Process(ReadOnlySpan<char> batch, Span<char> scratch, out int written)
    {
        long total = 0;
        written = 0;

        ReadOnlySpan<char> remaining = batch;
        while (!remaining.IsEmpty)
        {
            ReadOnlySpan<char> record = TakeUntil(ref remaining, '\n');
            if (!TryParseRecord(record, out ReadOnlySpan<char> id, out int quantity))
            {
                continue;
            }

            int needed = (written == 0 ? 0 : 1) + id.Length + 1 + DigitCount(quantity);
            if (needed > scratch.Length - written)
            {
                throw new ArgumentException("scratch buffer is too small", nameof(scratch));
            }

            if (written > 0)
            {
                scratch[written++] = ';';
            }

            id.CopyTo(scratch[written..]);
            written += id.Length;
            scratch[written++] = ':';
            quantity.TryFormat(scratch[written..], out int digits);
            written += digits;

            total += quantity;
        }

        return total;
    }

    /// <summary>
    /// The pooled, measured run. One allocation by design - the summary.
    /// </summary>
    public static BatchReport Run(string batch)
    {
        ArgumentNullException.ThrowIfNull(batch);

        // The summary is never longer than the batch: ";qty=" collapses to ":"
        // and skipped records shorten it further. So the batch length is a
        // bound we can prove without counting anything first.
        char[] buffer = ArrayPool<char>.Shared.Rent(Math.Max(batch.Length, 1));
        try
        {
            long bytesBefore = GC.GetAllocatedBytesForCurrentThread();
            int gen0Before = GC.CollectionCount(0);

            long total = Process(batch, buffer, out int written);
            string summary = written == 0 ? string.Empty : new string(buffer, 0, written);

            long bytes = GC.GetAllocatedBytesForCurrentThread() - bytesBefore;
            int gen0 = GC.CollectionCount(0) - gen0Before;

            return new BatchReport(CountPairs(summary), total, summary, bytes, gen0);
        }
        finally
        {
            ArrayPool<char>.Shared.Return(buffer, clearArray: false);
        }
    }

    /// <summary>The obvious version, kept as the baseline to beat.</summary>
    public static BatchReport RunNaive(string batch)
    {
        ArgumentNullException.ThrowIfNull(batch);

        long bytesBefore = GC.GetAllocatedBytesForCurrentThread();
        int gen0Before = GC.CollectionCount(0);

        long total = 0;
        List<string> parts = new();
        foreach (string record in batch.Split('\n'))
        {
            string[] fields = record.Split(';');
            if (fields.Length != 2)
            {
                continue;
            }

            string[] left = fields[0].Split('=');
            string[] right = fields[1].Split('=');
            if (left.Length != 2 || right.Length != 2 || left[0] != "id" || right[0] != "qty")
            {
                continue;
            }

            if (!int.TryParse(right[1], out int quantity) || quantity < 0 || left[1].Length == 0)
            {
                continue;
            }

            parts.Add($"{left[1]}:{quantity}");
            total += quantity;
        }

        string summary = string.Join(";", parts);
        long bytes = GC.GetAllocatedBytesForCurrentThread() - bytesBefore;
        int gen0 = GC.CollectionCount(0) - gen0Before;

        return new BatchReport(parts.Count, total, summary, bytes, gen0);
    }

    private static bool TryParseRecord(
        ReadOnlySpan<char> record,
        out ReadOnlySpan<char> id,
        out int quantity)
    {
        id = default;
        quantity = 0;

        int semi = record.IndexOf(';');
        if (semi < 0)
        {
            return false;
        }

        ReadOnlySpan<char> first = record[..semi];
        ReadOnlySpan<char> second = record[(semi + 1)..];

        if (!first.StartsWith("id=") || !second.StartsWith("qty="))
        {
            return false;
        }

        id = first["id=".Length..];
        if (id.IsEmpty)
        {
            return false;
        }

        return int.TryParse(second["qty=".Length..], out quantity) && quantity >= 0;
    }

    private static ReadOnlySpan<char> TakeUntil(ref ReadOnlySpan<char> remaining, char separator)
    {
        int end = remaining.IndexOf(separator);
        if (end < 0)
        {
            ReadOnlySpan<char> last = remaining;
            remaining = default;
            return last;
        }

        ReadOnlySpan<char> segment = remaining[..end];
        remaining = remaining[(end + 1)..];
        return segment;
    }

    private static int CountPairs(ReadOnlySpan<char> summary)
    {
        if (summary.IsEmpty)
        {
            return 0;
        }

        int count = 1;
        foreach (char c in summary)
        {
            if (c == ';')
            {
                count++;
            }
        }

        return count;
    }

    private static int DigitCount(int value)
    {
        int digits = 1;
        while (value >= 10)
        {
            value /= 10;
            digits++;
        }

        return digits;
    }
}
