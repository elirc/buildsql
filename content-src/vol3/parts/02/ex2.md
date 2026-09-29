@@PROMPT@@
## Exercise 2 - the argument, settled with a counter

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex2.cs`.

Insert `count` items into the middle of a collection of `initial` items, and
count what each structure actually does.

- `InsertionCost.ForList(int initial, int count)` returns
  `(int ElementMoves, int NodeAllocations, int PointerHops)`: a `List<T>`
  insert at index `k` moves `size - k` elements, allocates no nodes, and
  reaches the position by arithmetic (`0` hops).
- `InsertionCost.ForLinkedList(int initial, int count)` returns the same
  triple for a `LinkedList<T>`: no element moves, one node allocation per
  insert, and `k` pointer hops to walk to the position.
- Both insert at the middle, `k = size / 2`, recomputed as the collection
  grows.
- `InsertionCost.Recommend(int initial, int count)` returns `"List"` or
  `"LinkedList"` using this stated rule: a pointer hop costs 20 units (a
  dependent cache miss), a node allocation costs 8, and an element move costs
  1 (contiguous, prefetched). Ties go to `"List"`.

```
ForList(1000, 1)        -> (500, 0, 0)
ForLinkedList(1000, 1)  -> (0, 1, 500)
Recommend(1000, 1)      -> "List"      (500 vs 10,008)
Recommend(4, 100)       -> "List"
ForList(0, 3)           -> (0, 0, 0)   (middle of an empty list is index 0)
```

`initial` or `count` below zero throws `ArgumentOutOfRangeException`.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex2
```
@@HINTS@@
## Hint 1

Nothing here needs a real collection — you are counting, not storing. Track the
current size in a local, and for each insertion work out `k = size / 2`, add
the costs, then increment the size. The gate can check exact numbers because
the model is arithmetic.

## Hint 2

The cost of a `List` insert, seen from the array's point of view:

```csharp
// Insert at k in a list of size n: elements k..n-1 move up one slot.
int moves = size - k;
```

Notice that inserting at the end costs zero moves and inserting at the front
costs `size` — the same method, a hundredfold difference, which is why
`insertFront` had its own row in ex1.

## Hint 3

`Recommend` is the weighted sum of the two triples, compared. The weights
encode the claim the sector is making — that a dependent cache miss is worth
about twenty contiguous element moves — so make them named constants rather
than magic numbers in an expression, and leave yourself able to change one and
see the recommendation flip. Try `Recommend(1_000_000, 1)` afterwards and see
whether it does.
@@IMPORTANT@@
## Hint 1

Predict the answer before you write the code. For a thousand elements, the
list moves 500 ints — two kilobytes, one `Array.Copy`, sub-microsecond. The
linked list makes 500 dependent loads, each of which may miss cache. Which
number do you expect to dominate, and by roughly how much?

## Hint 2

The reason the walk is so expensive is that it cannot be pipelined:

```csharp
node = node.Next;   // the address of the next node is unknown
node = node.Next;   // until this load returns - no prefetching possible
```

A contiguous scan has the opposite property: the CPU can predict every address
and fetch ahead, which is why `moves` and `hops` deserve wildly different
weights.

## Hint 3

Watch the empty and tiny cases. `size / 2` of 0 is 0 and of 1 is 0, so the
first few inserts cost almost nothing in either structure; the divergence only
starts once the collection is big. Make sure `ForList(0, 3)` gives `(0, 0, 0)`
and convince yourself why — it is the sanity check that your `k` is recomputed
per insertion rather than fixed up front.
@@REF@@
// v3cc02_collections_by_numbers / ex2 - the argument, settled with a counter.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 2".

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>
/// Counts what a middle insertion actually does in each structure. The
/// weights encode the claim of this sector: a dependent cache miss is worth
/// roughly twenty contiguous element moves.
/// </summary>
public static class InsertionCost
{
    private const int PointerHopUnits = 20;
    private const int NodeAllocationUnits = 8;
    private const int ElementMoveUnits = 1;

    public static (int ElementMoves, int NodeAllocations, int PointerHops) ForList(int initial, int count)
    {
        Validate(initial, count);

        int moves = 0;
        int size = initial;
        for (int i = 0; i < count; i++)
        {
            int k = size / 2;
            moves += size - k;   // everything from k up shifts one slot
            size++;
        }

        return (moves, 0, 0);
    }

    public static (int ElementMoves, int NodeAllocations, int PointerHops) ForLinkedList(int initial, int count)
    {
        Validate(initial, count);

        int hops = 0;
        int size = initial;
        for (int i = 0; i < count; i++)
        {
            hops += size / 2;    // walking to the position is the real cost
            size++;
        }

        return (0, count, hops);
    }

    public static string Recommend(int initial, int count)
    {
        (int listMoves, int listNodes, int listHops) = ForList(initial, count);
        (int linkedMoves, int linkedNodes, int linkedHops) = ForLinkedList(initial, count);

        long listCost = Weigh(listMoves, listNodes, listHops);
        long linkedCost = Weigh(linkedMoves, linkedNodes, linkedHops);

        return linkedCost < listCost ? "LinkedList" : "List";
    }

    private static long Weigh(int moves, int nodes, int hops) =>
        ((long)moves * ElementMoveUnits) +
        ((long)nodes * NodeAllocationUnits) +
        ((long)hops * PointerHopUnits);

    private static void Validate(int initial, int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(initial);
        ArgumentOutOfRangeException.ThrowIfNegative(count);
    }
}
