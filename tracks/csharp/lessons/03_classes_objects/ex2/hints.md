## Hint 1

Both members you have to write are *computed*: they store nothing, they read
the three properties that are already there and work something out. If you find
yourself adding a field, back out.

`Display` has a pluralisation decision in it. You have made that exact decision
before, in lesson 00 ex2, and got the zero case wrong the first time.

## Hint 2

`TotalExercises` is one expression: the core count, plus one more when there is
a challenge. `HasChallenge ? 1 : 0` turns the bool into that "one more".

`Display` has two moving parts — the noun and the trailing "+ challenge" — so
compute each into a local and interpolate once at the end. That means a
statement body rather than an expression body:

```csharp
public string Display
{
    get
    {
        // ...
    }
}
```

## Hint 3

```csharp
string noun = /* exactly one? */ ? "exercise" : "exercises";
string tail = HasChallenge ? " + challenge" : "";
return $"{Slug}: {Exercises} {noun}{tail}";
```

Note the leading space inside `" + challenge"` — the pieces have to carry their
own separators when the alternative is nothing at all. Check that against the
expected string in the gate before you run it.
