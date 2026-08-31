# Reading - csharp/d13_lists_dictionaries

## Notes

The skill this set drills is picking the operation that matches the question,
and knowing each operation's edge behaviour cold: what `IndexOf` says on a
miss, what the indexer does that `Add` does not, what happens when you remove
while enumerating. A `List` is about *positions* - insert here, remove there,
everything behind shifts. A `Dictionary` is about *keys* - and nearly every
dictionary bug in real code is one of three misses: indexing a key that is not
there, `Add`-ing a key that is, or mutating the collection mid-walk. The
pattern uniting the eight problems: decide what the missing case means
(`false`, `null`, zero, empty list, or an exception) before writing the happy
path, because the gate always probes the miss.

## ex1

Really testing: that `List` positions are live - `Insert` shifts everything
behind it, and an index from `IndexOf` is only valid until the next mutation.
The classic mistake is `AddAfter` on a missing anchor: `IndexOf` answers -1,
and blindly inserting at `-1 + 1` puts the item at the FRONT, which looks
almost right in a short test and is wrong. The model answer checks the -1
first, appends on a miss, and lets the list's own indexer guard `Swap` -
`ArgumentOutOfRangeException` is already the correct exception, so adding your
own guard would only duplicate it.

## ex2

Really testing: the add-or-accumulate idiom and a deliberate remove rule.
`stock[item] = stock.GetValueOrDefault(item) + quantity` handles first-sight
and top-up in one line. The classic mistake is in `Take`: checking and
mutating in the wrong order, so a refused take still decrements, or leaving a
zero-quantity line in place. The model answer reads once with `TryGetValue`,
refuses early, and treats exact-empty as `Remove` - because "we stock zero
washers" and "we do not stock washers" must be indistinguishable to callers.

## ex3

Really testing: the three write operations and what each promises. The indexer
means "make it so" (add or overwrite), `Add` means "this must be new" (throws
otherwise), and `TryAdd` means "only if absent, and tell me". The classic
mistake is using `Add` for a re-assignment and meeting `ArgumentException` at
runtime. `OccupantsOf` makes the other point of the exercise: a dictionary
answers person -> office instantly, but office -> people means scanning every
pair - a dictionary is one-directional, and querying against the grain is a
linear walk (or a second dictionary, which is ex7's shape).

## ex4

Really testing: the mutate-versus-copy contract. `List.Sort` rearranges the
caller's list and returns nothing; `OrderBy...ToList()` builds a new one and
touches nothing. The classic mistake is sorting the caller's data when they
only wanted a ranked view - a bug callers find much later, far from the call.
The second skill is writing a `Comparison<Entry>`: negative, zero, positive.
Descending scores is `b.Score.CompareTo(a.Score)` - swap the operands, do not
negate the result (negating breaks on int.MinValue in the general case, and
reads worse). Ties fall through to an ordinal name comparison.

## ex5

Really testing: the remove-while-enumerating rule. `foreach` over a dictionary
while removing from it throws `InvalidOperationException`, so the model answer
materialises the doomed keys with `ToList()` - the snapshot ends the
enumeration before the mutation starts - then removes by key. For the `List`,
`RemoveAll` exists precisely so you do not write the backwards-index loop by
hand, and it returns the count the exercise asks for. The classic mistake is
`foreach (var pair in readings) readings.Remove(pair.Key)` which fails at
runtime, on the second iteration, only when something matched.

## ex6

Really testing: that value tuples make composite keys trivial. Tuples compare
by position with value equality and hash accordingly, so `(from, to)` just
works as a `Dictionary` key - no custom type, no comparer, and `(a, b)` is
never equal to `(b, a)`. The classic mistake is modelling this as
`Dictionary<string, Dictionary<string, decimal>>` when a flat composite key is
simpler, or concatenating strings (`"leeds->york"`) and inheriting every
delimiter bug that entails. `CheapestFrom` is another against-the-grain scan:
filter pairs on `Key.From`, order by value then destination, take the first -
`FirstOrDefault` gives the null for free.

## ex7

Really testing: the two-level miss. With `Dictionary<string, Dictionary<...>>`
every read is two lookups and each can fail, so `ScoreOf` chains two
`TryGetValue` calls; indexing either level on a miss throws
`KeyNotFoundException`. In `Record`, the classic mistake is
`book[student][subject] = score` without ensuring the inner dictionary exists
- the fix is the get-or-create idiom: `TryGetValue`, create-and-store on the
miss, then write through the local. `SubjectAverage` filters students to those
who contain the subject before averaging, and the empty case throws because
that is `Average`'s honest answer to "the average of nothing".

## ex8

Really testing: trading a nested loop for a dictionary. The naive two-sum is
O(n squared); the model answer walks once, asking "has my complement been
seen?" before storing "value -> earliest position". Checking BEFORE storing is
what stops a number pairing with itself at the same position, and storing only
the first occurrence (`TryAdd`, or a `ContainsKey` guard) is what makes
`[1, 4, 1, 5]` answer (0, 3) rather than (2, 3). The classic mistake is
`Add`, which throws on the first duplicate value - `[3, 3, 3]` finds it
immediately. This exact problem, with this exact fix, is probably the most
asked interview warm-up in existence.

## Further reading

- [List&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1) - Insert, RemoveAt, IndexOf, RemoveAll, Sort.
- [Dictionary&lt;TKey, TValue&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2) - the indexer, Add, TryAdd, TryGetValue, Remove.
- [Comparison&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.comparison-1) - the delegate List.Sort takes.
- [Value tuples](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples) - equality and why they work as keys.
- [Sorting data (C# LINQ)](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/sorting-data) - OrderBy/ThenBy for the copying variant.
