# Authoring a C# lesson

Read `BUILD_SPEC.md` §7 (exercise anatomy), §8 (hints) and §12 (quality bar)
first — they apply verbatim. This file covers only what is specific to the
C# track: where files go, how a gate reaches the learner's code, and how
`dojo verify` swaps the reference solutions in.

`tracks/csharp/lessons/00_hello_dojo/` is the worked example. Copy its shape.

## File layout

A lesson's files are split across three places, and the split is enforced by
`dojo verify`:

```
tracks/csharp/
├── src/Lessons/L03_ClassesObjects/     learner-edited code
│   ├── Ex1.cs
│   ├── Ex2.cs
│   ├── Ex3.cs
│   └── Challenge.cs
├── tests/Gates/L03_ClassesObjectsTests.cs   the gate (one class per lesson)
└── lessons/03_classes_objects/         prose, hints, reference solutions
    ├── README.md
    ├── reading.md
    ├── ex1/
    │   ├── hints.md
    │   └── .reference/Ex1.cs
    ├── ex2/  ex3/  challenge/  review1/   (same shape)
```

## Naming — all of it derives from the slug

`dojo.tracks.source_folder()` turns a slug into the one name everything else
is built from:

| slug | folder / namespace suffix | gate class | `--filter` prefix |
|---|---|---|---|
| `00_hello_dojo` | `L00_HelloDojo` | `L00_HelloDojoTests` | `L00_` |
| `10_linq_1` | `L10_Linq1` | `L10_Linq1Tests` | `L10_` |
| `i2_interview_drills` | `I2_InterviewDrills` | `I2_InterviewDrillsTests` | `I2_` |

So for `03_classes_objects`:

- source folder: `src/Lessons/L03_ClassesObjects/`
- namespace: `namespace CSharpDojo.L03_ClassesObjects;` (file-scoped, with the
  semicolon)
- gate class: `tests/Gates/L03_ClassesObjectsTests.cs`, `namespace CSharpDojo.Gates;`
- test methods: `Ex1_SomethingDescriptive`, `Ex2_...`, `Challenge_...`,
  `Review1_...`

**The method-name rule is load-bearing.** `dojo test csharp 03 ex2` becomes
`dotnet test --filter "FullyQualifiedName~L03_&FullyQualifiedName~Ex2"`, and
the harness maps a trx result back to an exercise by taking the method name,
lowercasing it, and matching `ex\d+|challenge|review\d+` at the front. The
character after the exercise key must not be a letter or digit — so
`Ex2_Describe` works and `Ex2Describe` does not. Always use the underscore.

## How the gate reaches learner code

Plain `using`. The gate class opens with `using CSharpDojo.L03_ClassesObjects;`
and then calls the types directly:

```csharp
using CSharpDojo.L03_ClassesObjects;

namespace CSharpDojo.Gates;

public class L03_ClassesObjectsTests
{
    [Fact]
    public void Ex1_AccountStartsAtZero()
    {
        var account = new Account("Ada");

        Teach.Equal(0m, account.Balance,
            "A new Account should start with a zero balance - reread README ex1.");
    }
}
```

`tests/Gates` already has a project reference to `src/Lessons`, so nothing
needs wiring; a new folder under `src/Lessons/` is compiled automatically.

## Assertions that teach

`Teach` (in `tests/Gates/Teach.cs`) is the house assertion helper. Prefer it
over bare `Assert.*` — xUnit's `Assert.Equal` gives a diff with nowhere to put
a sentence, and `Assert.True` gives a sentence with no evidence.

- `Teach.Equal(expected, actual, because)` — value equality, and on failure
  prints `because` first, then `expected:` / `actual:` lines.
- `Teach.True(condition, because)` — for anything that isn't an equality.
- `Teach.Throws<TException>(action, because)` — for exercises about failure.

Every `because` string should answer BUILD_SPEC §12's rule of thumb: which
check failed, what the evidence means, and which README section to reread.
Name the section (`"reread README ex2"`), don't just restate the assertion.

## Stubs

A stub must **compile** and must **fail** its gate. The standard form:

```csharp
public static string Describe(string name, int lessons)
{
    throw new NotImplementedException("ex2: Describe is not implemented yet - edit this file.");
}
```

`throw` satisfies every return type, so the solution always builds even with
every exercise unstarted — which is what keeps one unfinished lesson from
breaking the lesson next to it. Top the file with a two-line comment naming
the lesson/exercise and pointing at the README section (see the demo lesson).

Where an exercise is about *designing* a type rather than filling in a body,
ship the type with the members declared and the bodies throwing, so the gate
compiles against the shape you intend.

## `.reference/` and how the overlay works

`lessons/<slug>/exN/.reference/` mirrors the learner files for that exercise,
**by file name**. `dojo verify` maps `exN/.reference/Ex1.cs` to
`src/Lessons/<folder>/Ex1.cs` — same basename, lesson's source folder. If an
exercise legitimately touches two files, put both in `.reference/`; both get
overlaid.

Verification does this per lesson:

1. Back the learner files up to a temp dir.
2. Copy the references over them (stamping the mtime to now, so MSBuild
   actually recompiles — this is why you must never hand-roll the overlay).
3. Run the real gates: everything must pass.
4. Restore the stubs in a `finally` (an `atexit` hook is armed too, so even a
   crash puts your working tree back).
5. Run the gates again with the stubs: everything must fail.

Consequently: a reference file with no matching learner file is a lint error,
and a stub that accidentally passes is a lint-stage failure you have to fix.

## Prose requirements (lint-enforced)

- `README.md` must quote **every** `[Fact]` declaration line verbatim. In
  practice: paste the whole gate class into a fenced ```csharp block, as the
  demo lesson does.
- `reading.md` needs `## Notes` (≥25 words), one `## exN` section per manifest
  exercise (≥25 words each, and one for `challenge` / `review1` where they
  exist), and `## Further reading` with **≥3 links** — prefer
  `learn.microsoft.com`.
- Every exercise dir needs `hints.md` with exactly 2 or 3 `## Hint N`
  sections. Hint 3 must still leave one decision to the learner.
- Every exercise dir needs a non-empty `.reference/`.

## Updating the manifest

`tracks/csharp/curriculum.py` is the contract. If you add or remove an
exercise, change the count there in the same commit or `dojo verify` will fail
with "manifest exercise 'ex4' has no directory".

## Running it

```
uv run dojo test csharp 03_classes_objects        # whole lesson
uv run dojo test csharp 03_classes_objects ex2    # one exercise
uv run dojo verify csharp 03_classes_objects      # lint + reference + pristine
uv run dojo verify csharp                         # every authored lesson
```

Verify sets `DOJO_NO_PROGRESS=1` for you, so authoring never pollutes the
learner's `data/progress.json`. When you run `dojo test` by hand while
authoring, set it yourself.
