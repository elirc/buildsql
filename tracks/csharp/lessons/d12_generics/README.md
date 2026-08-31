# d12 - Generics drills

Eight problems on writing code once for every type: generic methods, a generic
type with two parameters, the `class` / `struct` / `notnull` constraints,
`IComparable<T>` as a constraint, `new()` and a pool, several type parameters
with delegates, a memo, and a histogram with a tie-break. They drill lesson 07
- reread `07_generics` if constraints are still unfamiliar.

Every file lives in `src/Lessons/D12_Generics/`. Nothing here depends on
anything else here.

## Exercise 1 - generic methods

`Sequences.Repeat<T>(item, count)` returns a list of `count` copies, and an
empty list for a count of 0 or less. `Sequences.Interleave<T>(a, b)` takes from
each sequence in turn - `a1, b1, a2, b2, ...` - and then whatever is left of
the longer one.

Edit `src/Lessons/D12_Generics/Ex1.cs`.

```
uv run dojo test csharp d12_generics ex1
```

## Exercise 2 - a generic type of your own

`Pair<TFirst, TSecond>` with `First`, `Second`, a `ToString` of
`"(a, b)"`, and `Swapped()` returning a `Pair<TSecond, TFirst>`.

Edit `src/Lessons/D12_Generics/Ex2.cs`.

```
uv run dojo test csharp d12_generics ex2
```

## Exercise 3 - three constraints

`Defaults.RefOrFallback<TRef>` (`where TRef : class`),
`Defaults.ValueOrFallback<TVal>` (`where TVal : struct`) and
`Defaults.CountBy<TKey>` (`where TKey : notnull`), which counts how many times
each key appears.

Edit `src/Lessons/D12_Generics/Ex3.cs`.

```
uv run dojo test csharp d12_generics ex3
```

## Exercise 4 - constrained to be comparable

`Range<T> where T : IComparable<T>` with inclusive `Contains`, `Clamp` and
`Overlaps`. A low above the high is an `ArgumentException`. Everything is built
from `CompareTo` - `<` and `>` are not available on an unconstrained `T`.

Edit `src/Lessons/D12_Generics/Ex4.cs`.

```
uv run dojo test csharp d12_generics ex4
```

## Exercise 5 - the `new()` constraint

`Pool<T> where T : class, new()` with `Rent()`, `Return(item)`, `Created` and
`Available`. `Rent` reuses a returned instance before constructing a new one,
and throws `InvalidOperationException` when it would exceed its maximum.

Edit `src/Lessons/D12_Generics/Ex5.cs`.

```
uv run dojo test csharp d12_generics ex5
```

## Exercise 6 - several type parameters

`Maps.Map<TSource, TResult>(items, selector)` projects a sequence.
`Maps.ToDictionary<TSource, TKey, TValue>(items, key, value)` builds a
dictionary in which a repeated key keeps the **later** value. Both infer every
type parameter from the arguments.

Edit `src/Lessons/D12_Generics/Ex6.cs`.

```
uv run dojo test csharp d12_generics ex6
```

## Exercise 7 - a memo

`Memo<TKey, TValue> where TKey : notnull` with
`GetOrAdd(key, Func<TKey, TValue> factory)`, `Count` and `FactoryCalls`. The
factory runs once per key; a factory that throws must leave the memo unchanged
so the next call tries again.

Edit `src/Lessons/D12_Generics/Ex7.cs`.

```
uv run dojo test csharp d12_generics ex7
```

## Exercise 8 - a histogram with a tie-break

`Histogram<TKey> where TKey : notnull` with `Add(key)`, `CountOf(key)`,
`Distinct` and `TopKeys(n)`. Keys come back most frequent first, and keys with
the same count come back in the order they were **first seen**.

Edit `src/Lessons/D12_Generics/Ex8.cs`.

```
uv run dojo test csharp d12_generics ex8
```

## The gate

This is the entire gate class, `tests/Gates/D12_GenericsTests.cs`:

```csharp
using CSharpDojo.D12_Generics;

namespace CSharpDojo.Gates;

public class D12_GenericsTests
{
    private sealed class Widget
    {
        public int Id { get; set; }
    }

    [Fact]
    public void Ex1_GenericMethodsThatNeedNoConstraint()
    {
        Teach.Equal("x, x, x", string.Join(", ", Sequences.Repeat("x", 3)),
            "Three copies of the item - reread README ex1.");
        Teach.Equal(0, Sequences.Repeat("x", 0).Count, "Zero copies is an empty list.");
        Teach.Equal(0, Sequences.Repeat("x", -4).Count,
            "...and a negative count needs no guard: the loop simply never runs.");
        Teach.Equal("7, 7", string.Join(", ", Sequences.Repeat(7, 2)),
            "The same method works for int, because it never asks what T is.");

        Teach.Equal("1, 10, 2, 20, 3",
            string.Join(", ", Sequences.Interleave(new[] { 1, 2, 3 }, new[] { 10, 20 })),
            "One from each in turn, then the tail of the longer one - reread README ex1.");
        Teach.Equal("1, 2", string.Join(", ", Sequences.Interleave(Array.Empty<int>(), new[] { 1, 2 })),
            "An empty first sequence leaves only the second.");
        Teach.Equal("1", string.Join(", ", Sequences.Interleave(new[] { 1 }, Array.Empty<int>())),
            "...and the other way round.");
        Teach.Equal(0, Sequences.Interleave(Array.Empty<string>(), Array.Empty<string>()).Count,
            "Two empty sequences interleave to nothing.");
    }

    [Fact]
    public void Ex2_AGenericTypeOfYourOwn()
    {
        Pair<int, string> pair = new Pair<int, string>(1, "a");

        Teach.Equal(1, pair.First, "The first component keeps its own type...");
        Teach.Equal("a", pair.Second, "...and so does the second.");
        Teach.Equal("(1, a)", pair.ToString(), "Both components in brackets - reread README ex2.");

        Pair<string, int> swapped = pair.Swapped();
        Teach.Equal("a", swapped.First,
            "Swapped returns a Pair<TSecond, TFirst> - the same generic type with the "
                + "arguments the other way round - reread README ex2.");
        Teach.Equal(1, swapped.Second, "...and the components follow.");
        Teach.Equal("(a, 1)", swapped.ToString(), "...which the text shows.");

        Teach.Equal("(1, a)", pair.ToString(), "The original is untouched.");
        Teach.Equal("(True, 2.5)", new Pair<bool, double>(true, 2.5).ToString(),
            "Any two types at all - and note that bool.ToString() capitalises, which is the "
                + "sort of detail interpolation quietly inherits.");
    }

    [Fact]
    public void Ex3_ClassStructNotnull()
    {
        Teach.Equal("x", Defaults.RefOrFallback<string>(null, "x"),
            "A null reference falls back - reread README ex3.");
        Teach.Equal("a", Defaults.RefOrFallback("a", "x"), "...and a real value does not.");

        Teach.Equal(7, Defaults.ValueOrFallback<int>(null, 7),
            "An empty Nullable<int> falls back. Note this is a DIFFERENT `?` from the one "
                + "above: here it means Nullable<T> - reread README ex3.");
        Teach.Equal(3, Defaults.ValueOrFallback<int>(3, 7), "...and a present value does not.");
        Teach.Equal(0, Defaults.ValueOrFallback<int>(0, 7),
            "0 is a VALUE, not an absence - `??` asks the nullable, not the number.");

        Dictionary<string, int> counts = Defaults.CountBy(new[] { "a", "b", "a", "a" });
        Teach.Equal(2, counts.Count, "Two distinct keys.");
        Teach.Equal(3, counts["a"], "Three of them were 'a' - reread README ex3.");
        Teach.Equal(1, counts["b"], "...and one was 'b'.");
        Teach.Equal(0, Defaults.CountBy(Array.Empty<string>()).Count, "Nothing counts to nothing.");
        Teach.Equal(2, Defaults.CountBy(new[] { 5, 5 })[5],
            "The same method counts ints, because `notnull` allows both kinds of key.");
    }

    [Fact]
    public void Ex4_EverythingBuiltFromOneConstrainedMember()
    {
        Range<int> range = new Range<int>(1, 5);

        Teach.True(range.Contains(1), "The low bound is INSIDE - reread README ex4.");
        Teach.True(range.Contains(5), "...and so is the high bound.");
        Teach.True(range.Contains(3), "...and everything between.");
        Teach.True(!range.Contains(0), "Below is outside.");
        Teach.True(!range.Contains(6), "So is above.");

        Teach.Equal(1, range.Clamp(0), "Clamping pulls a low value up to the bound.");
        Teach.Equal(5, range.Clamp(9), "...and a high value down.");
        Teach.Equal(3, range.Clamp(3), "...and leaves an inside value alone.");

        Teach.True(range.Overlaps(new Range<int>(5, 9)),
            "They share exactly the value 5, and inclusive bounds means that counts "
                + "- reread README ex4.");
        Teach.True(!range.Overlaps(new Range<int>(6, 9)), "One past the end shares nothing.");
        Teach.True(!range.Overlaps(new Range<int>(-3, 0)), "Nor does one below.");
        Teach.True(range.Overlaps(new Range<int>(2, 3)), "A range wholly inside overlaps.");
        Teach.True(range.Overlaps(new Range<int>(-9, 99)), "So does one that swallows it.");

        Range<string> letters = new Range<string>("b", "d");
        Teach.True(letters.Contains("c"),
            "The same class orders strings, because string implements IComparable<string> "
                + "- reread README ex4.");
        Teach.True(!letters.Contains("a"), "...and knows what is outside.");

        Range<int> single = new Range<int>(3, 3);
        Teach.True(single.Contains(3), "A range of one value is allowed.");

        Teach.Throws<ArgumentException>(() => new Range<int>(5, 1),
            "A low above the high is not a range - reread README ex4.");
    }

    [Fact]
    public void Ex5_TheNewConstraint()
    {
        Pool<Widget> pool = new Pool<Widget>(2);

        Teach.Equal(0, pool.Created, "Nothing has been made yet.");
        Teach.Equal(0, pool.Available, "...and nothing is waiting.");

        Widget first = pool.Rent();
        Teach.Equal(1, pool.Created, "Renting with an empty pool constructs one - `new T()` is "
            + "legal only because of the new() constraint - reread README ex5.");
        Teach.Equal(0, pool.Available, "...and it is out on loan, not waiting.");

        Widget second = pool.Rent();
        Teach.Equal(2, pool.Created, "A second one, up to the maximum.");
        Teach.True(!ReferenceEquals(first, second), "Two rentals are two objects.");

        Teach.Throws<InvalidOperationException>(() => pool.Rent(),
            "A third would exceed the maximum. Every argument was fine and the OBJECT is the "
                + "problem, so InvalidOperationException - reread README ex5.");

        pool.Return(first);
        Teach.Equal(1, pool.Available, "Returning it makes it available again.");

        Widget third = pool.Rent();
        Teach.True(ReferenceEquals(third, first),
            "...and the next rental REUSES it - check the free list before the limit, or a "
                + "full pool refuses to hand back what it already owns - reread README ex5.");
        Teach.Equal(2, pool.Created, "...without constructing anything new.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new Pool<Widget>(0),
            "A pool of nothing is not a pool.");
    }

    [Fact]
    public void Ex6_SeveralTypeParametersAllInferred()
    {
        Teach.Equal("1, 2, 3",
            string.Join(", ", Maps.Map(new[] { "a", "bb", "ccc" }, s => s.Length)),
            "TSource is string and TResult is int, both inferred from the arguments - the "
                + "caller writes no angle brackets at all - reread README ex6.");
        Teach.Equal(0, Maps.Map(Array.Empty<string>(), s => s.Length).Count,
            "An empty sequence maps to an empty list.");

        Dictionary<char, string> byInitial = Maps.ToDictionary(
            new[] { "apple", "avocado", "beet" }, s => s[0], s => s);

        Teach.Equal(2, byInitial.Count, "Two distinct initials.");
        Teach.Equal("avocado", byInitial['a'],
            "Two words start with 'a', and the LATER one wins - this specification chose to "
                + "replace where LINQ's own ToDictionary throws - reread README ex6.");
        Teach.Equal("beet", byInitial['b'], "...and the single 'b'.");

        Dictionary<int, int> squares = Maps.ToDictionary(new[] { 1, 2, 3 }, n => n, n => n * n);
        Teach.Equal(9, squares[3], "Three different type parameters, none of them written out.");
    }

    [Fact]
    public void Ex7_AMemo()
    {
        Memo<string, int> memo = new Memo<string, int>();

        Teach.Equal(2, memo.GetOrAdd("ab", key => key.Length), "The first ask computes it.");
        Teach.Equal(1, memo.FactoryCalls, "...calling the factory once.");
        Teach.Equal(1, memo.Count, "...and storing one answer.");

        Teach.Equal(2, memo.GetOrAdd("ab", key => 99),
            "The second ask returns the STORED answer, so the new factory never runs - if this "
                + "is 99, the lookup happened after the factory - reread README ex7.");
        Teach.Equal(1, memo.FactoryCalls, "...and the count of real calls is unchanged.");

        Teach.Equal(3, memo.GetOrAdd("xyz", key => key.Length), "A different key is a new answer.");
        Teach.Equal(2, memo.FactoryCalls, "...so the factory ran again.");
        Teach.Equal(2, memo.Count, "Two keys now.");

        Teach.Throws<InvalidOperationException>(
            () => memo.GetOrAdd("boom", key => throw new InvalidOperationException("no")),
            "A factory that throws lets the exception reach the caller - reread README ex7.");
        Teach.Equal(2, memo.Count,
            "...and stores NOTHING, because the write comes after the call - reread README ex7.");
        Teach.Equal(3, memo.FactoryCalls, "The attempt still counted as a call.");

        Teach.Equal(7, memo.GetOrAdd("boom", key => 7),
            "...so the next attempt at the same key really does try again.");
        Teach.Equal(3, memo.Count, "...and this time it sticks.");
    }

    [Fact]
    public void Ex8_CountingWithATieBreak()
    {
        Histogram<string> histogram = new Histogram<string>();
        foreach (string key in new[] { "a", "b", "a", "c", "b", "a" })
        {
            histogram.Add(key);
        }

        Teach.Equal(3, histogram.CountOf("a"), "Three a's.");
        Teach.Equal(2, histogram.CountOf("b"), "Two b's.");
        Teach.Equal(1, histogram.CountOf("c"), "One c.");
        Teach.Equal(0, histogram.CountOf("zz"),
            "A key never seen is 0, not an exception - reread README ex8.");
        Teach.Equal(3, histogram.Distinct, "Three different keys.");

        Teach.Equal("a, b", string.Join(", ", histogram.TopKeys(2)),
            "Most frequent first - reread README ex8.");
        Teach.Equal("a, b, c", string.Join(", ", histogram.TopKeys(10)),
            "Asking for more than there are gives everything, without a guard.");
        Teach.Equal(0, histogram.TopKeys(0).Count, "Asking for none gives none.");
        Teach.Equal(0, histogram.TopKeys(-1).Count, "...and so does asking for fewer than none.");

        histogram.Add("d");
        histogram.Add("d");

        Teach.Equal("a, b, d", string.Join(", ", histogram.TopKeys(3)),
            "'b' and 'd' both have 2, and 'b' was seen first - so the tie-break is the "
                + "FIRST-SEEN order, which a Dictionary alone cannot tell you "
                + "- reread README ex8.");
        Teach.Equal("a, b, d, c", string.Join(", ", histogram.TopKeys(4)),
            "...and 'c', with 1, comes last despite being seen before 'd'.");
    }
}
```
