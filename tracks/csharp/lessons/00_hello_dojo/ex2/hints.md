## Hint 1

Two of the three expected outputs are the same shape and one is not. Write
the three of them out and circle the single character that differs:

```
csharp: 14 lessons
react: 1 lesson
dotnet: 0 lessons
```

That character is the whole exercise. Everything else is the same interpolated
string you wrote for ex1.

## Hint 2

You need a value that is `"lesson"` in exactly one case and `"lessons"` in
every other case — including zero. Compute it into a local variable *before*
you build the result, then interpolate it like any other value.

The conditional operator (`condition ? a : b`) is the compact way; a plain
`if`/`else` is equally correct and equally readable.

Be careful with the condition. "More than one" and "exactly one" agree on 14
and disagree on 0.

## Hint 3

The shape is:

```csharp
string noun = /* the condition */ ? "lesson" : "lessons";
return $"{name}: {lessons} {noun}";
```

The condition compares `lessons` to `1`, and it is an equality test — `==`,
not `>`. Note that interpolating the `int` directly is fine: C# calls
`ToString()` on it for you, so you do not need a conversion here.
