# Reading - csharp/v3cc06_benchmarking_honestly

## Notes

**A benchmark is an experiment with a hypothesis.** "Is A faster than B, at
this size, on this runtime, for this input distribution?" Every one of those
qualifiers is part of the result, and a number quoted without them is not
transferable. The commonest failure of benchmarking is not a wrong measurement,
it is a correct measurement of the wrong question.

**Dead code elimination is the first thing that goes wrong.** The JIT is
permitted to delete work whose result nothing uses. A benchmark body that
computes and discards is measuring an empty loop. Returning the value from the
benchmark method is the fix; BenchmarkDotNet consumes the return value
specifically so this does not happen.

**Constant folding is the second.** `Math.Sqrt(144)` on a literal is computed
at compile time or hoisted out of the loop. Anything the compiler can prove
invariant will be, so inputs must come from fields the optimiser cannot see
through — which is why benchmark inputs are properties or fields set in
`[GlobalSetup]`, not literals in the body.

**Setup inside the measured region measures the setup.** `[GlobalSetup]` runs
once per parameter set, `[IterationSetup]` runs before each iteration and is
excluded — but `[IterationSetup]` has its own overhead and is only appropriate
for benchmarks long enough to swamp it. Allocating the input array inside the
benchmark makes the allocator part of your measurement.

**Warm-up exists because the first run is not representative.** Tiered
compilation means a method starts in a quick, unoptimised tier and is
recompiled after it has run enough times; on-stack replacement handles
long-running loops. Caches are cold. Static constructors have not run. A
measurement taken before all of that has settled describes the startup path,
which may be what you want — but only if you say so.

**Error and StdDev are different columns.** `StdDev` describes the spread of
the samples. `Error` is half the 99.9% confidence interval of the *mean*, and
it shrinks as you take more samples while `StdDev` does not. Two means whose
error bars overlap are not distinguishable, no matter how different the point
estimates look.

**The mean is fragile; the median is not.** A single GC pause in one sample
moves the mean and leaves the median where it was. BenchmarkDotNet removes
outliers by default (`OutlierMode.RemoveUpper`) precisely because of this — and
that default is itself a decision you should know about, because sometimes the
pauses *are* the thing you care about.

**Ratio has a direction people get wrong.** `Ratio = 1.25` means the row takes
1.25 times as long as the baseline: 25% slower. The corresponding speed-up
language ("25% faster") describes `Ratio = 0.8`. Getting this backwards in a
pull request description is common and embarrassing.

## ex1

Really testing: whether you can write a body that survives the optimiser. The
rule is that the result must escape — returned from the method, or assigned to
a field the JIT cannot prove unused — and the input must not be a literal.
The classic mistake is a `void` benchmark whose work is provably dead; it
reports a few nanoseconds and people conclude the operation is free. The
validator half of the exercise makes you name the failure rather than just
avoid it, which is the reviewable skill.

## ex2

Really testing: the ratio column and its direction. A baseline is required for
a ratio to exist at all, and exactly one row can be it. The classic mistake is
reading 1.25 as a win. The secondary point is that a ratio without an error is
not enough: BenchmarkDotNet prints `RatioSD` alongside for the same reason it
prints `Error` — a ratio computed from two noisy means is itself noisy.

## ex3

Really testing: that a benchmark produces a distribution and a summary of it is
lossy. The Tukey fence — anything outside `Q1 - 1.5 x IQR` to `Q3 + 1.5 x IQR` —
is the standard rule and the one BenchmarkDotNet uses by default for upper
outliers. The classic mistake is averaging without looking: a run whose mean is
40 microseconds and median 6 is not a 40-microsecond operation, it is a
6-microsecond operation that occasionally stalls, and the correct response is
to investigate the stall rather than to quote either number.

## ex4

Really testing: the difference between a measurement and a result. Two
confidence intervals that overlap mean the data cannot distinguish the
candidates; the honest verdict is "no measurable difference", not "A was
slightly faster". The classic mistake is comparing point estimates. The other
half — the minimum detectable effect — turns that into something actionable:
"with this much noise and this many samples, we could not have seen a 2%
change, so this experiment cannot support that claim".

## ex5

Really testing: unit conversion done exactly, because a benchmark report that
rounds badly is misread. Nanoseconds to operations per second is
`1e9 / meanNs`, and the unit ladder switches at 1000 with three significant
decimals. The classic mistake is a throughput figure computed from a mean that
has already been rounded for display, which compounds the error — convert from
the raw value, format at the end.

## ex6

Really testing: reading the memory column as a first-class result rather than a
footnote. `Allocated` is bytes per operation and is exact, not sampled; Gen0
counts are per thousand operations by convention, which is why a value below
0.001 shows as a dash. The classic mistake is optimising time while allocation
climbs, which shows up later as GC pressure in a service and never in the
microbenchmark. The decision rule is the exercise: a 5% slower path that
allocates 90% less is usually a win at scale, and you should be able to say
under what conditions it is not.

## ex7

Really testing: pattern recognition for broken experiments. Each reason code
names a distinct failure — the code was deleted, the input was constant, the
setup was measured, state leaked between iterations, the operation was
dominated by I/O, the operation was too fast to time. The classic mistake is
assuming BenchmarkDotNet protects you from all of them; it protects you from
some, warns about others, and cannot know that your benchmark shares a
`Dictionary` between iterations and gets faster as it warms.

## ex8

Really testing: statistical honesty under machine noise. Running the *same*
code twice gives you the noise floor, and any claimed improvement smaller than
that floor is unsupported by the experiment. The classic mistake is a 3% win
measured once on a laptop with a browser open. The sample-size calculation
closes the loop: if you need to detect 2%, and your run-to-run spread is 4%,
you need enough samples to shrink the interval — or a quieter machine, which is
usually cheaper.

## Further reading

- [BenchmarkDotNet documentation](https://benchmarkdotnet.org/articles/overview.html) - jobs, diagnosers, and the run pipeline.
- [Good practices](https://benchmarkdotnet.org/articles/guides/good-practices.html) - the tool's own list of ways to get it wrong.
- [Tiered compilation](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation) - why the first calls are not representative.
- [MemoryDiagnoser](https://benchmarkdotnet.org/articles/configs/diagnosers.html) - allocated bytes and gen counts.
- [GC.GetAllocatedBytesForCurrentThread](https://learn.microsoft.com/en-us/dotnet/api/system.gc.getallocatedbytesforcurrentthread) - the same measurement, by hand.
- [Performance measurement in .NET](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) - profilers and counters, for when a microbenchmark is the wrong tool.
