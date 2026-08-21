## Hint 1

The signature is already written for you and it already does half the work:
the defaults mean a caller who passes only a name gets `"Hello"` and `false`
without you writing anything.

So the body is only about the two variations. Read the four expected outputs
and notice that shouting changes *two* things, not one.

## Hint 2

Build the normal line first — salutation, comma, name, and the closing
punctuation — then decide whether the whole thing gets upper-cased.

The closing character depends on `shout`, so it is a small conditional inside
the interpolation, or a local computed just before it:

```csharp
string end = shout ? "!" : ".";
```

`ToUpperInvariant()` is the upper-casing you want. `ToUpper()` uses the current
culture, and there is a famous Turkish-dotless-i bug waiting there for anyone
who upper-cases identifiers with it.

## Hint 3

```csharp
string line = $"{salutation}, {name}{/* the closing character */}";
return shout ? /* the loud version */ : line;
```

Upper-casing at the end, once, is what keeps the two variations from
multiplying into four branches. Note you never write `if (salutation == null)`
anywhere — an omitted optional argument is filled in by the *compiler at the
call site*, so it is never missing by the time your body runs.
