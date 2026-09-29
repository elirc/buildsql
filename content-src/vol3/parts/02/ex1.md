@@PROMPT@@
## Exercise 1 - the cost table you can defend

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex1.cs`.

`CostModel.ComplexityOf(string collection, string operation)` returns the
worst-case-or-amortised complexity as a string. Collections: `"List"`,
`"LinkedList"`, `"Dictionary"`, `"SortedList"`, `"SortedDictionary"`,
`"HashSet"`, `"Array"`. Operations: `"index"`, `"append"`, `"insertFront"`,
`"lookupByKey"`, `"containsValue"`, `"removeByKey"`, `"iterateInOrder"`.

Unknown collections or operations, and combinations that do not exist for that
collection (`"lookupByKey"` on a `List`), return `"unsupported"`. Comparison is
ordinal and case sensitive.

`CostModel.Explain(string collection, string operation)` returns one sentence
naming the *mechanism*, not the letter: for `("List", "insertFront")`,
`"every element shifts up one position"`.

```
ComplexityOf("List", "index")                   -> "O(1)"
ComplexityOf("List", "append")                  -> "O(1) amortised"
ComplexityOf("List", "insertFront")             -> "O(n)"
ComplexityOf("Dictionary", "lookupByKey")       -> "O(1)"
ComplexityOf("Dictionary", "iterateInOrder")    -> "unsupported"
ComplexityOf("SortedList", "append")            -> "O(n)"
ComplexityOf("SortedDictionary", "lookupByKey") -> "O(log n)"
ComplexityOf("LinkedList", "index")             -> "O(n)"
ComplexityOf("Array", "append")                 -> "unsupported"
Explain("List", "append")   -> "amortised because doubling makes the copies sum to less than n"
```

The gate asks for every pair. `"unsupported"` is a real answer, not a fallback
you can return for everything.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex1
```
@@HINTS@@
## Hint 1

This is a lookup table, so build a lookup table: a
`Dictionary<(string, string), string>` keyed by the pair. A value tuple is a
perfectly good composite key and hashes correctly, unlike a concatenated
string, which inherits every delimiter bug you can imagine.

## Hint 2

The tricky rows are the ones where two operations share a name but not a cost:

```csharp
["SortedList", "lookupByKey"]  = "O(log n)"   // binary search over the key array
["SortedList", "append"]       = "O(n)"       // ...but the insert shifts both arrays
```

`SortedList` is the one people get wrong, because the search and the insert
have different complexities.

## Hint 3

Write the table, then read it back critically: `Array` has no `"append"`,
`Dictionary` has no `"iterateInOrder"`, and `List` has no `"lookupByKey"` or
`"removeByKey"` because it has no keys. Decide whether `"containsValue"` on a
`Dictionary` is `"O(n)"` or unsupported — it exists, it scans every value, and
saying so is the point.
@@IMPORTANT@@
## Hint 1

Do not start from the letters. For each pair, describe in one sentence what the
machine does — "hashes, indexes a bucket, follows a short chain", "copies the
tail up one slot" — and the complexity falls out of the sentence. That is also
how you answer the question in an interview without sounding memorised.

## Hint 2

`"amortised"` is doing real work in this table and belongs on exactly the
operations that occasionally do O(n) work to buy cheap operations later:

```csharp
list.Add(x);   // usually a store; occasionally copies the whole backing array
```

An operation that is O(1) every single time — indexing an array — does not get
the word, and one that is O(n) every time does not either.

## Hint 3

For `Explain`, keep the sentences short and mechanical, and make sure the
`unsupported` pairs have an explanation too — "a Dictionary has no defined
order, so there is nothing to iterate in order" is more useful to a learner
than an empty string. Decide what `Explain` returns for a genuinely unknown
collection name, and be consistent with `ComplexityOf`.
@@REF@@
// v3cc02_collections_by_numbers / ex1 - the cost table you can defend.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 1".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// The complexity table with its exceptions intact. Keyed by a value tuple:
/// tuples hash by position, so (a, b) and (b, a) are different keys and no
/// delimiter is involved.
/// </summary>
public static class CostModel
{
    public const string Unsupported = "unsupported";

    private static readonly Dictionary<(string Collection, string Operation), (string Cost, string Why)> Table = new()
    {
        [("List", "index")] = ("O(1)", "the backing array is contiguous, so the address is arithmetic"),
        [("List", "append")] = ("O(1) amortised", "amortised because doubling makes the copies sum to less than n"),
        [("List", "insertFront")] = ("O(n)", "every element shifts up one position"),
        [("List", "containsValue")] = ("O(n)", "a linear scan comparing each element"),
        [("List", "iterateInOrder")] = ("O(n)", "walks the backing array in index order"),

        [("LinkedList", "index")] = ("O(n)", "no random access: each Next is a dependent load"),
        [("LinkedList", "append")] = ("O(1)", "the list holds the tail node, so it is three pointer writes"),
        [("LinkedList", "insertFront")] = ("O(1)", "the head node is already in hand"),
        [("LinkedList", "containsValue")] = ("O(n)", "walks node by node, one cache miss per element"),
        [("LinkedList", "iterateInOrder")] = ("O(n)", "insertion order, one dependent load per element"),

        [("Dictionary", "lookupByKey")] = ("O(1)", "hash, index a bucket, follow a short chain"),
        [("Dictionary", "append")] = ("O(1) amortised", "amortised because a resize rehashes every entry"),
        [("Dictionary", "removeByKey")] = ("O(1)", "unlinks the entry and adds its slot to the free list"),
        [("Dictionary", "containsValue")] = ("O(n)", "values are not indexed, so it scans every entry"),
        [("Dictionary", "iterateInOrder")] = (Unsupported, "a Dictionary has no defined order to iterate in"),

        [("SortedList", "lookupByKey")] = ("O(log n)", "binary search over the sorted key array"),
        [("SortedList", "append")] = ("O(n)", "the key and value arrays both shift to keep order"),
        [("SortedList", "removeByKey")] = ("O(n)", "both arrays close the gap"),
        [("SortedList", "index")] = ("O(1)", "the parallel arrays are indexable by position"),
        [("SortedList", "iterateInOrder")] = ("O(n)", "the arrays are already in key order"),

        [("SortedDictionary", "lookupByKey")] = ("O(log n)", "a red-black tree descent"),
        [("SortedDictionary", "append")] = ("O(log n)", "insert plus rebalancing along the path"),
        [("SortedDictionary", "removeByKey")] = ("O(log n)", "remove plus rebalancing along the path"),
        [("SortedDictionary", "iterateInOrder")] = ("O(n)", "an in-order traversal of the tree"),

        [("HashSet", "containsValue")] = ("O(1)", "the same bucket probe a Dictionary does"),
        [("HashSet", "append")] = ("O(1) amortised", "amortised because a resize rehashes every element"),
        [("HashSet", "iterateInOrder")] = (Unsupported, "a HashSet has no defined order to iterate in"),

        [("Array", "index")] = ("O(1)", "a bounds check and an offset load"),
        [("Array", "append")] = (Unsupported, "an array has a fixed length; appending means allocating a new one"),
        [("Array", "containsValue")] = ("O(n)", "a linear scan"),
        [("Array", "iterateInOrder")] = ("O(n)", "sequential, and the prefetcher loves it"),
    };

    public static string ComplexityOf(string collection, string operation) =>
        Table.TryGetValue((collection, operation), out (string Cost, string Why) entry)
            ? entry.Cost
            : Unsupported;

    public static string Explain(string collection, string operation) =>
        Table.TryGetValue((collection, operation), out (string Cost, string Why) entry)
            ? entry.Why
            : $"'{operation}' is not an operation {collection} supports";
}
