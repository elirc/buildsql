# V3·C6 — Benchmarking with BenchmarkDotNet, and reading the results honestly

Sector C1 gave you allocation numbers and sector C2 gave you cost models. Both
were predictions. This sector is about measurement — and specifically about the
uncomfortable fact that most microbenchmarks people write are broken
experiments producing confident numbers.

The three ways they break, in order of frequency: the code being measured was
deleted by the JIT because nothing consumed its result; the setup was inside
the measured region; and the difference reported was smaller than the machine's
own noise. BenchmarkDotNet exists to eliminate the first two and to *report*
the third honestly. What it cannot do is stop you reading a ratio of 1.03 as an
improvement.

## The shape of a benchmark that measures something

```csharp
[MemoryDiagnoser]
[SimpleJob(RuntimeMoniker.Net80)]
public class JoinBenchmarks
{
    [Params(10, 1_000)]
    public int Count { get; set; }

    private int[] data = [];

    [GlobalSetup]
    public void Setup() => data = Enumerable.Range(0, Count).ToArray();

    [Benchmark(Baseline = true)]
    public string Concat() { ... }

    [Benchmark]
    public string Builder() { ... }
}
```

Every attribute is load-bearing. `[GlobalSetup]` runs once per parameter
combination and is not measured. `[Params]` runs the whole matrix so you see
how the answer changes with `n` — because "faster" almost always means "faster
at this size". `[Benchmark(Baseline = true)]` gives you the `Ratio` column.
`[MemoryDiagnoser]` adds allocated bytes per operation. And **each method
returns its result**, because a benchmark whose result is discarded may be
optimised into nothing at all.

## What the tool actually does

It generates a separate project per benchmark, compiles it in release, runs it
in its own process, and works out how many iterations are needed to measure
reliably. Then it warms up — so the JIT has tiered up and the caches are
populated — and only then measures, subtracting the overhead of the harness
itself. Finally it reports a *distribution*: mean, error, standard deviation,
median, and sometimes percentiles.

The distribution is the point. A single number cannot tell you whether a
change is real. Two numbers with their error bars can.

## Reading a results table

```
| Method  | Count | Mean       | Error    | StdDev   | Ratio | Allocated |
|-------- |------ |-----------:|---------:|---------:|------:|----------:|
| Concat  | 1000  | 82.41 us   | 1.62 us  | 1.51 us  |  1.00 | 1,955 KB  |
| Builder | 1000  |  6.13 us   | 0.12 us  | 0.11 us  |  0.07 |    12 KB  |
```

`Mean` is the average time per operation. `Error` is half the 99.9% confidence
interval of the mean — not the spread of the samples, which is `StdDev`.
`Ratio` is relative to the baseline, so 0.07 means "takes 7% of the time".
`Allocated` is bytes per operation, and it is exact rather than sampled.

A ratio of 0.07 with errors of 2% is a real result. A ratio of 0.97 with errors
of 5% is not a result at all, and reporting it as a 3% win is the most common
form of benchmark dishonesty.

## Exercise 1 - the shape of a measurable benchmark

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex1.cs`. Implement the workload
methods a benchmark class would call — each returning a consumed value, with
setup hoisted out — plus `BenchmarkAudit.Validate`, which reports why a given
benchmark body cannot be measured.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex1
```

## Exercise 2 - baselines and ratios

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex2.cs`. Compute the `Ratio`
column against the baseline row, format it as BenchmarkDotNet does, and produce
the verdict sentence — including the sign trap, where 1.25 means 25% slower.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex2
```

## Exercise 3 - the distribution, not the number

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex3.cs`. Mean, median, sample
standard deviation, and a Tukey-fence outlier filter over a run's raw samples —
then the demonstration that one GC pause moves the mean and leaves the median
alone.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex3
```

## Exercise 4 - is the difference real?

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex4.cs`. Compare two runs by
overlapping confidence intervals, return `"faster"`, `"slower"` or
`"no measurable difference"`, and compute the minimum detectable effect for the
noise you actually have.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex4
```

## Exercise 5 - units and throughput

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex5.cs`. Nanoseconds per
operation to operations per second and back, and unit selection with the
rounding rules BenchmarkDotNet uses, so `1234.5 ns` prints as `1.234 us`.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex5
```

## Exercise 6 - the memory column

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex6.cs`. Allocated bytes per
operation and gen0 collections per thousand operations, plus a stated decision
rule for the change that is 5% slower and allocates 90% less.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex6
```

## Exercise 7 - the traps, classified

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex7.cs`. Given descriptions of
benchmark bodies, return a reason code: `DeadCode`, `ConstantFolded`,
`SetupInsideBody`, `SharedMutableState`, `IOBound`, `TooFastToMeasure`, or
`Sound`.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex7
```

## Exercise 8 - honesty about noise

Edit `src/Lessons/V3CC06_BenchmarkingHonestly/Ex8.cs`. Given repeated runs of
the *same* code on a noisy machine, compute the run-to-run variance, decide
whether a claimed 3% win survives it, and report how many samples would be
needed to detect an effect that size.

```
uv run dojo test csharp v3cc06_benchmarking_honestly ex8
```

## Challenge

`ResultsAnalyser` takes a full results table, drops outliers, ranks by mean
with ratios and confidence intervals, attaches the memory verdict, and emits
one honest summary line per row — including "no measurable difference" where
that is the truth. It is the report you would actually paste into a pull
request.

## Review

`review1` inverts the sector: instead of reading results, you write the
measurement *plan* for a performance claim — what to measure, against what
baseline, and what result would falsify the claim. A claim with no
falsification condition is not an engineering claim.
