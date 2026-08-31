# d02 - Strings and formatting drills

Eight problems on the type you touch more than any other: padding and
truncating, format specifiers, splitting and joining, `StringBuilder`,
comparison rules, and three small text algorithms. They drill lesson 01's
string and culture material - if the format specifiers feel unfamiliar, reread
`01_types_variables` first.

Every file lives in `src/Lessons/D02_StringsFormatting/`. Nothing here depends
on anything else here.

## Exercise 1 - fit a fixed column

`Fit(text, width)` returns a string of exactly `width` characters: padded on
the right when short, and truncated to `width - 3` plus `"..."` when long. A
width below 4 throws `ArgumentOutOfRangeException`. `Center(text, width)`
centres inside the field, giving any odd space to the right, and returns text
that is already wide enough unchanged.

Edit `src/Lessons/D02_StringsFormatting/Ex1.cs`.

```
uv run dojo test csharp d02_strings_formatting ex1
```

## Exercise 2 - three format specifiers

`Money(1234.5m)` is `"1,234.50"`. `Percent(0.1234)` is `"12.3%"` - one decimal,
always. `Hex(255)` is `"0x00FF"` - upper case, four digits minimum. All three
use the invariant culture, and none of them uses `Replace`.

Edit `src/Lessons/D02_StringsFormatting/Ex2.cs`.

```
uv run dojo test csharp d02_strings_formatting ex2
```

## Exercise 3 - the delimited line, both ways

`Join(fields)` trims each field, drops the null and blank ones, and joins with
`", "`. `Split(line)` does the inverse and returns a `List<string>`; a null or
blank line gives an empty list.

Edit `src/Lessons/D02_StringsFormatting/Ex3.cs`.

```
uv run dojo test csharp d02_strings_formatting ex3
```

## Exercise 4 - build it with a builder

`Repeat(word, times, separator)` puts the separator between copies only, and
answers `""` for a count of zero or less. `Reverse(text)` reverses the
characters. Both use a `StringBuilder`.

Edit `src/Lessons/D02_StringsFormatting/Ex4.cs`.

```
uv run dojo test csharp d02_strings_formatting ex4
```

## Exercise 5 - which "equal" did you mean

`SameName(a, b)` trims and compares ordinally ignoring case, treating two nulls
as equal and one null as not. `SortKey(name)` returns the trimmed,
invariant-upper-cased grouping key. `StartsWithIgnoringCase(text, prefix)` does
what it says, ordinally.

Edit `src/Lessons/D02_StringsFormatting/Ex5.cs`.

```
uv run dojo test csharp d02_strings_formatting ex5
```

## Exercise 6 - a tiny template engine

`Render(template, values)` replaces every `{key}` with its value. An unknown
key is left exactly as written, braces and all; a `{` with no matching `}` is
ordinary text; everything else is copied through. Braces do not nest.

Edit `src/Lessons/D02_StringsFormatting/Ex6.cs`.

```
uv run dojo test csharp d02_strings_formatting ex6
```

## Exercise 7 - greedy word wrap

`Lines(text, width)` breaks text into lines no longer than `width`, filling
each line while the next word still fits. Runs of whitespace collapse, a word
longer than the width gets its own line rather than being broken, and text with
no words gives an empty list.

Edit `src/Lessons/D02_StringsFormatting/Ex7.cs`.

```
uv run dojo test csharp d02_strings_formatting ex7
```

## Exercise 8 - the URL slug

`From(title)` keeps letters and digits (lower-cased, invariant), turns every
run of anything else into a single `-`, and leaves no hyphen at either end.
`"  C# 12 -- What's New?  "` becomes `"c-12-what-s-new"`.

Edit `src/Lessons/D02_StringsFormatting/Ex8.cs`.

```
uv run dojo test csharp d02_strings_formatting ex8
```

## The gate

This is the entire gate class, `tests/Gates/D02_StringsFormattingTests.cs`:

```csharp
using CSharpDojo.D02_StringsFormatting;

namespace CSharpDojo.Gates;

public class D02_StringsFormattingTests
{
    [Fact]
    public void Ex1_FitAndCenterAFixedColumn()
    {
        Teach.Equal("ab   ", Labels.Fit("ab", 5),
            "Short text is padded on the RIGHT to exactly the field width - reread README ex1.");
        Teach.Equal("abcde", Labels.Fit("abcde", 5),
            "Text that already fills the field is returned untouched - no ellipsis.");
        Teach.Equal("ab...", Labels.Fit("abcdef", 5),
            "Too long, so keep width - 3 characters and add the ellipsis: the RESULT is still "
                + "exactly 5 wide. If you got 'abc...' you truncated to width - reread README ex1.");
        Teach.Equal("    ", Labels.Fit("", 4), "Empty text is all padding.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Labels.Fit("abc", 3),
            "A field of 3 cannot hold '...' plus anything, so the width itself is the bug "
                + "- reread README ex1.");

        Teach.Equal("  ab  ", Labels.Center("ab", 6),
            "Four spare characters split evenly - reread README ex1.");
        Teach.Equal(" abc  ", Labels.Center("abc", 6),
            "Three spare characters, and the ODD one goes to the right: one space before, two "
                + "after - reread README ex1.");
        Teach.Equal("abcdef", Labels.Center("abcdef", 6), "Exactly full means nothing to add.");
        Teach.Equal("abcdefg", Labels.Center("abcdefg", 3),
            "Text wider than the field comes back unchanged rather than truncated - Center "
                + "never loses characters.");
    }

    [Fact]
    public void Ex2_FormatSpecifiersNotStringSurgery()
    {
        Teach.Equal("1,234.50", Formats.Money(1234.5m),
            "N2 gives group separators and exactly two decimals, and the invariant culture "
                + "fixes which characters those are - reread README ex2.");
        Teach.Equal("-3.00", Formats.Money(-3m), "A whole number still shows both decimals.");
        Teach.Equal("0.00", Formats.Money(0m), "Zero is formatted like everything else.");
        Teach.Equal("1,000,000.00", Formats.Money(1000000m), "Every group gets a separator.");

        Teach.Equal("12.3%", Formats.Percent(0.1234),
            "A ratio is multiplied by 100 first, then shown with one decimal - reread README ex2.");
        Teach.Equal("50.0%", Formats.Percent(0.5),
            "One decimal ALWAYS, even when it is a zero: '0.0' is a fixed-shape format.");
        Teach.Equal("0.0%", Formats.Percent(0), "Zero included.");
        Teach.Equal("-25.0%", Formats.Percent(-0.25), "Negatives keep their sign.");

        Teach.Equal("0x00FF", Formats.Hex(255),
            "X4 means upper-case hex padded to four digits - reread README ex2.");
        Teach.Equal("0x0000", Formats.Hex(0), "Zero pads out to four digits too.");
        Teach.Equal("0x1000", Formats.Hex(4096), "And a value that already fills four digits.");
    }

    [Fact]
    public void Ex3_SplitAndJoinADelimitedLine()
    {
        Teach.Equal("a, b", Csv.Join(new string?[] { " a ", "", null, "b" }),
            "Each field is trimmed, and the empty and null ones are dropped rather than "
                + "leaving ', , ' holes in the output - reread README ex3.");
        Teach.Equal("", Csv.Join(Array.Empty<string?>()), "Nothing to join is the empty string.");
        Teach.Equal("", Csv.Join(new string?[] { null, "  " }),
            "Nothing SURVIVES, so still the empty string - and not a stray separator.");

        Teach.Equal("a|b", string.Join("|", Csv.Split(" a , ,b ")),
            "Split, trim, drop the blanks - reread README ex3.");
        Teach.Equal(0, Csv.Split(null).Count, "A null line is an empty list, not a crash.");
        Teach.Equal(0, Csv.Split("   ").Count, "A blank line likewise.");
        Teach.Equal("one", string.Join("|", Csv.Split("one")),
            "A line with no separator is one field.");
    }

    [Fact]
    public void Ex4_BuildingStringsWithABuilder()
    {
        Teach.Equal("ab-ab-ab", Builder.Repeat("ab", 3, "-"),
            "The separator goes BETWEEN copies, so three copies have two separators - a "
                + "trailing '-' means you appended it with every item - reread README ex4.");
        Teach.Equal("ab", Builder.Repeat("ab", 1, "-"), "One copy needs no separator at all.");
        Teach.Equal("", Builder.Repeat("ab", 0, "-"), "Zero copies is the empty string.");
        Teach.Equal("", Builder.Repeat("ab", -2, "-"),
            "A negative count is not an exception here - the loop simply never runs.");
        Teach.Equal("xxx", Builder.Repeat("x", 3, ""), "An empty separator is still a separator.");

        Teach.Equal("cba", Builder.Reverse("abc"), "Walk the characters backwards - reread README ex4.");
        Teach.Equal("desserts", Builder.Reverse("stressed"), "The classic example.");
        Teach.Equal("", Builder.Reverse(""), "Nothing reversed is nothing.");
        Teach.Equal("a", Builder.Reverse("a"), "One character is its own reverse.");
    }

    [Fact]
    public void Ex5_WhichEqualDidYouMean()
    {
        Teach.True(Names.SameName(" Ada ", "ADA"),
            "Trim first, then compare ignoring case - reread README ex5.");
        Teach.True(Names.SameName(null, null),
            "Two absences match. A null check that calls Trim() on a null throws instead "
                + "- reread README ex5.");
        Teach.True(!Names.SameName(null, "a"), "One absence does not match a name...");
        Teach.True(!Names.SameName("a", null), "...in either order.");
        Teach.True(!Names.SameName("ada", "adam"), "And different names are different names.");

        Teach.Equal("ADA", Names.SortKey(" ada "),
            "A grouping key is trimmed and upper-cased with the INVARIANT culture, so the same "
                + "input gives the same key on every machine - reread README ex5.");
        Teach.Equal("MIXED", Names.SortKey("MiXeD"), "Case is flattened.");

        Teach.True(Names.StartsWithIgnoringCase("Hello", "he"), "Prefix, ignoring case.");
        Teach.True(!Names.StartsWithIgnoringCase("Hello", "lo"),
            "'lo' is a suffix, not a prefix.");
        Teach.True(Names.StartsWithIgnoringCase("Hello", ""),
            "Every string starts with the empty string - that is not a special case you write, "
                + "it is what StartsWith already does.");
    }

    [Fact]
    public void Ex6_ATinyTemplateEngine()
    {
        Dictionary<string, string> values = new Dictionary<string, string>
        {
            ["name"] = "Ada",
            ["a"] = "1",
            ["b"] = "2",
        };

        Teach.Equal("Hi Ada!", Template.Render("Hi {name}!", values),
            "The token is replaced and the text around it is copied through - reread README ex6.");
        Teach.Equal("12", Template.Render("{a}{b}", values),
            "Two tokens back to back, with nothing between them.");
        Teach.Equal("no tokens", Template.Render("no tokens", values),
            "A template with no braces is returned as it was.");

        Teach.Equal("Hi {who}!", Template.Render("Hi {who}!", values),
            "An unknown key is left EXACTLY as written, braces included - a template engine "
                + "that silently drops unknown tokens hides the typo - reread README ex6.");
        Teach.Equal("{unclosed", Template.Render("{unclosed", values),
            "A '{' with no '}' after it is ordinary text, and the rest of the template still "
                + "comes through - reread README ex6.");
        Teach.Equal("}1", Template.Render("}{a}", values),
            "A stray '}' is ordinary text too.");
        Teach.Equal("{}", Template.Render("{}", values),
            "The empty key is not in the dictionary, so it is left alone like any other "
                + "unknown token.");
    }

    [Fact]
    public void Ex7_GreedyWordWrap()
    {
        Teach.Equal("the quick|brown fox", string.Join("|", Wrap.Lines("the quick brown fox", 10)),
            "Greedy means: fill the line while the next word still fits. 'the quick' is 9 and "
                + "adding 'brown' would make 15 - reread README ex7.");
        Teach.Equal("one two", string.Join("|", Wrap.Lines("one two", 7)),
            "Exactly the width still fits: the test is <= width, not < width - reread README ex7.");
        Teach.Equal("a|b|c", string.Join("|", Wrap.Lines("a b c", 1)),
            "A width of 1 puts every word on its own line.");
        Teach.Equal("supercalifragilistic",
            string.Join("|", Wrap.Lines("supercalifragilistic", 5)),
            "A word longer than the width is NOT broken - it gets a line of its own and "
                + "overflows - reread README ex7.");
        Teach.Equal("the quick|brown fox",
            string.Join("|", Wrap.Lines("  the   quick \n brown  fox  ", 10)),
            "Runs of whitespace - including newlines - collapse to a single separator, and "
                + "leading or trailing whitespace produces no empty lines - reread README ex7.");
        Teach.Equal(0, Wrap.Lines("   ", 5).Count,
            "Text with no words at all wraps to no lines, not to one empty line.");
    }

    [Fact]
    public void Ex8_TheUrlSlug()
    {
        Teach.Equal("hello-world", Slug.From("Hello, World!"),
            "Letters lower-cased, the comma-space run collapsed to one hyphen, and the "
                + "trailing '!' dropped without leaving a trailing hyphen - reread README ex8.");
        Teach.Equal("c-12-what-s-new", Slug.From("  C# 12 -- What's New?  "),
            "Every run of unusable characters - '# ', ' -- ', the apostrophe - becomes exactly "
                + "one hyphen, and the leading and trailing runs become nothing at all "
                + "- reread README ex8.");
        Teach.Equal("already-slugged", Slug.From("Already-slugged"),
            "A hyphen is just another separator, so an already-slugged title survives.");
        Teach.Equal("", Slug.From("---"),
            "Nothing usable means the empty string - not '-' and not '---' - reread README ex8.");
        Teach.Equal("", Slug.From(""), "And an empty title is empty.");
        Teach.Equal("abc123", Slug.From("abc123"), "Digits are kept.");
    }
}
```
