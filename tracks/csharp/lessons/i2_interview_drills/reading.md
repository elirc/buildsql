# Reading - csharp/i2_interview_drills

## Notes

**What a coding interview is actually measuring.** Not whether you can solve the
problem — the problems are small and you can. It is whether you clarify before
you code, whether you name your trade-offs, whether you handle the edge cases
without being prompted, and whether you can talk while you type. A candidate who
writes the perfect LRU cache in silence and a candidate who writes a slightly
scruffier one while saying "I'll use a linked list for the ordering so eviction
is O(1), and I'll need to keep the dictionary in sync when I evict" do not get
the same score. The second one does.

**The structure that works.** Repeat the problem back in your own words. Ask two
or three clarifying questions (what happens on duplicates? is it thread-safe?
how big is the input?). State your approach in one sentence and get a nod.
*Then* write. Talk through the edge cases as you handle them. When you finish,
say what you would test and what you would change with more time. That last
sentence is free marks and almost nobody says it.

**Time-boxes are diagnostic, not competitive.** If FizzBuzz-with-rules takes you
twenty minutes, the thing to fix is not typing speed — it is that the LINQ shape
is not yet automatic. Do it again a week later. The exercises here feed the
review ladder for exactly that reason.

**On "I'd use a library for this".** True and unhelpful mid-interview. The right
version is to say it *and then implement it*: "In production I'd reach for
`MemoryCache`, which does LRU-ish eviction with expiry — but let me write the
mechanism." That shows judgement without dodging the question.

## ex1

The twist turns a triviality into a design question, which is exactly why
interviewers use it. Hard-coded FizzBuzz has the divisors, the words, and the
`n % 15` special case baked into the algorithm; the rules-as-data version has
none of them. Notice that the combined case (15 -> "FizzBuzz") stops being a
special case at all once the words are concatenated in rule order — the
`n % 15` branch was never really necessary, it was an artefact of hard-coding.

`string.Concat` over an empty sequence returning `""` is what removes the last
`if`. That is worth generalising: when an operation has a natural identity value
(0 for addition, `""` for concatenation, `true` for `All`), leaning on it
deletes branches, and deleted branches cannot have bugs.

The standard follow-ups: "add a rule for 7" (no code change), "make it lazy"
(return `IEnumerable<string>` and drop the `ToList`), and "what if two rules
share a divisor?" (both words appear — which the specification allows, and
noticing it is a point in your favour).

## ex2

The LRU cache is the most-asked data-structure question for .NET roles, and the
reason is that it has exactly one insight: **you need two structures, and they
must stay in sync**. A dictionary answers "where is this key?" in O(1); a
doubly-linked list answers "what is the oldest?" in O(1) and can move a node to
the front in O(1) *because the node knows its neighbours*. Either alone gives
you an O(n) operation, and the interviewer will find it.

The sync requirement is where implementations break. Evicting must remove the
entry from both the list and the dictionary; updating must move the node and
keep the dictionary pointing at it. The gate's "read then put" sequence exists
to catch a cache that only refreshes recency on writes, which is a real and
common bug — and a cache that evicts things people are actively reading is worse
than no cache.

Follow-ups worth having ready. *Thread safety*: not safe; a `lock` around every
operation is the simple answer, and a genuinely concurrent LRU is hard because
the ordering list is a single point of contention (real implementations often
approximate, which is why `MemoryCache` does not promise strict LRU). *Expiry*:
store a timestamp per entry and evict lazily on read. *Why not `OrderedDictionary`*:
it does not give you move-to-front in O(1).

## ex3

Two things are being checked: that you get the words out correctly, and that the
output is deterministic.

Splitting on spaces is the failure everyone makes once — `"fox!"` and `"fox"`
become different words and every count is quietly wrong. Splitting on
"anything that is not a letter" is the specification, and a regex is the
shortest honest way to say it. If regex is off the table, a `foreach` over the
characters accumulating into a `StringBuilder` is five lines and reads fine.

The tie-break is the deterministic part. `GroupBy` makes no ordering promise
across groups with equal counts, so without `ThenBy(g => g.Key)` the answer can
differ between runs, between framework versions, and between your machine and
the interviewer's. It is the same rule as SQL's "a paging query needs a unique
`ORDER BY`", and stating it out loud is a strong signal.

The scale follow-up is worth rehearsing: a 10 GB file streams line by line into
the same dictionary, because the *distinct words* fit in memory even when the
text does not. And the distributed version is map-reduce — this exact algorithm
with the grouping sharded by word.

## ex4

The wrapper pattern is everywhere in .NET: `SqlConnection` returning to the
connection pool, `ArrayPool<T>` buffers, rented `IServiceScope`s. The rules are
always the same two — release exactly once, and refuse to be used after release
— and the reasons are worth being able to state.

Double release is the dangerous one. A connection returned twice sits in the
pool twice, is handed to two callers, and produces the sort of bug that only
appears under load and looks like data corruption. The `_disposed` guard is four
lines and it is the whole defence.

`ObjectDisposedException` is the standard way to say "you are using a corpse".
`ObjectDisposedException.ThrowIf(condition, instance)` (since .NET 7) is the
modern one-liner. Returning stale-but-plausible data instead is much worse: the
caller carries on, and the failure surfaces somewhere unrelated.

The follow-up about forgetting to dispose leads naturally to finalisers, and the
right answer is the one from lesson 12: a finaliser is for unmanaged resources
only, `SafeHandle` exists so you rarely write one, and the practical mitigation
for a pool is a diagnostic — a counter of outstanding rentals, or a debug-only
finaliser that logs.

## ex5

Three bugs, and the reason this drill exists is that all three are common enough
to appear in the same method in real code.

**Blocking** (`.Result`, `.Wait()`) wastes a thread and, under a
synchronization context, deadlocks. On a busy server it does not deadlock — it
just quietly halves your throughput, which is harder to notice and harder to
fix.

**Ignoring the token** is the subtlest. A method that accepts a
`CancellationToken` and never passes it on is *worse* than one that never took
it, because the caller believes cancellation works. Cancellation only functions
if every layer forwards it, which is why the parameter appears at the end of
every async signature in the BCL.

**Swallowing** turns a failure into a plausible answer. `return 0` on a total
means nobody can distinguish "no pages" from "the database was down", and the
report ships with a zero in it. If you cannot handle a failure, let it travel.
"Log and rethrow" is fine; "log and continue" is a decision somebody senior
should be making explicitly.

## ex6

`IEqualityComparer<T>` is the answer to "I need a different definition of equal,
and the type is not mine" — or "the type has one natural equality and I need
another one here". Both are common: a `Contact` might be equal by id in one
context and by email in another, and a type can only have one `Equals`.

The two-method contract is the same as lesson 06's: equal items must hash the
same. The trick that keeps them honest is a single private `Key` helper used by
both, so the definition of "the comparison value" exists once.

Hashing case-insensitively via `StringComparer.OrdinalIgnoreCase.GetHashCode`
rather than `key.ToLowerInvariant().GetHashCode()` is the detail an experienced
reviewer notices: the second allocates a string on every hash, which for a
dictionary lookup in a loop is real garbage.

Null handling is not defensive programming here — the framework genuinely passes
nulls while probing. `ReferenceEquals(x, y)` after a null check covers both
cases in one line.

## challenge

This is the shape of a real pairing exercise: several small requirements, no
individual difficulty, and enough of them that keeping track is the skill. The
things that separate a good submission from a passing one:

**Validation order.** Disposed, then customer, then lines, then each line. The
most fundamental problem should be the one reported, and a caller fixing one
error at a time should make progress.

**Precise exception types.** `ArgumentException` for structurally wrong input,
`ArgumentOutOfRangeException` for a value outside its range,
`KeyNotFoundException` for a missing id, `ObjectDisposedException` after
shutdown. This costs nothing and tells the caller exactly what to do.

**Defensive copying.** `lines.ToList()` on the way in. The caller still holds
that collection; if they clear it after placing the order, your stored order
must not change. This is lesson 01's reference semantics showing up as a
production concern, and it is the single detail most likely to earn a "nice"
from an interviewer.

**A report that groups.** `TopCustomers` is per *customer*, not per order, so it
needs the grouping from lesson 11 — and the tie-break, again, so the output is
deterministic.

Worth saying at the end, unprompted: what you would add with more time. Real
ids rather than a counter, an `IClock` for timestamps, thread safety, and a
repository interface so the storage can be swapped. Naming those shows you know
this is a sketch, which is the point of a 45-minute exercise.

## review1

The same idea as ex2 with the complexity dialled down to where a `List<string>`
is genuinely the right answer — and knowing *that* is the real lesson. A
recently-opened menu holds ten items; the O(n) `Remove` plus `Insert(0, …)`
costs nothing, and a linked list plus a dictionary would be over-engineering
somebody has to maintain.

The judgement being drilled: **pick the simplest structure that meets the actual
requirement, and be able to say when it stops being enough.** "This is O(n) per
touch, which is fine for a menu of ten and would not be for a cache of a
million" is a complete and confident answer, and it is much better than either
reaching for the complicated version by reflex or not knowing the difference.

The eviction-order detail (remove, insert, then trim) is the kind of small
sequencing decision that has one correct answer given the code around it — and
noticing that the order matters at all is what stops off-by-one bugs.

## Further reading

- [`MemoryCache`](https://learn.microsoft.com/en-us/dotnet/core/extensions/caching) — what you would use in production instead of ex2, and what it promises.
- [`IEqualityComparer<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.iequalitycomparer-1) — the contract, and where the framework applies it.
- [Implementing a Dispose method](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose) — the simple pattern used in ex4 and the full one you rarely need.
- [`ObjectDisposedException.ThrowIf`](https://learn.microsoft.com/en-us/dotnet/api/system.objectdisposedexception.throwif) — the modern guard one-liner.
- [Cancellation in managed threads](https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads) — the cooperative model ex5 depends on.
- [`Regex` quick reference](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference) — enough to write `[a-zA-Z]+` with confidence.
