# d03 - Object shapes (drill set)

Eight problems on describing objects: required and optional members, readonly,
index signatures, nested and recursive shapes, and copying instead of mutating.
They drill lesson **03_objects_interfaces**; go back there first if "optional
member" and "member that may be undefined" feel like the same thing.

Several stubs ship with a member typed `unknown`. That is not a placeholder you
may leave - `unknown` accepts every value, so it checks nothing, and the type
gate says so.

## ex1 - one track, one line

`trackLine(track)` renders a `Track` as `"<title> - <artist> (<seconds>s)"`,
with `" [E]"` appended when the track is explicit. `explicit` is optional, and
`explicit: false` must render exactly like a missing `explicit`.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex1
```

## ex2 - defaults that respect zero

`describeAlbum(input)` returns `"<title> [<label>] <year>"`. A missing `label`
becomes `"independent"`; a missing `year` renders as the word `"unknown"`.

- `{ title: "Homework" }` -> `"Homework [independent] unknown"`
- `{ title: "Homework", year: 1997, label: "Virgin" }` -> `"Homework [Virgin] 1997"`
- `{ title: "Bootleg", year: 0 }` -> `"Bootleg [independent] 0"`
- `{ title: "Bootleg", label: "" }` -> `"Bootleg [] unknown"`

Those last two are the exercise: a default fires for `undefined` and for
nothing else.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex2
```

## ex3 - append without mutating

`addTrack(playlist, title)` returns a **new** `Playlist` with the title appended.
The playlist you were handed, and its `tracks` array, must both come back
untouched.

Mark `id` and `tracks` as `readonly` on the interface, and make `tracks` a
`readonly string[]`. The type gate proves both.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex3
```

## ex4 - two optional levels deep

`contactLine(playlist)` returns `"<owner name> <<email>>"`, falling back to
`"anonymous"` and `"no email"`. The owner is optional, the contact inside it is
optional, and the email inside that is optional - and a value that is only
whitespace counts as missing.

- `{ name: "Mix" }` -> `"anonymous <no email>"`
- `{ name: "Mix", owner: { name: "Ada", contact: { email: "ada@example.com" } } }` -> `"Ada <ada@example.com>"`

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex4
```

## ex5 - a tally of objects

`byArtist(tracks)` returns an `ArtistTotals` - an index signature from artist
name to `{ count, seconds }`. An empty input returns `{}`.

Edit `ex5/solution.ts`, where the shipped index signature says the values are
`unknown`.

```
uv run dojo test typescript d03_objects_shapes ex5
```

## ex6 - keep only the tags that exist

`presentTags(meta)` copies across only those optional members whose value is a
non-empty string once trimmed, and trims the ones it keeps. Everything else -
`undefined`, `""`, `"   "` - is dropped.

- `{ genre: "  house  ", mood: "   ", era: undefined }` -> `{ genre: "house" }`

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex6
```

## ex7 - flatten a recursive shape

`MetaTree` is an index signature whose values are either a string leaf or
another `MetaTree`. `flattenMeta(tree)` returns a flat `Record<string, string>`
whose keys are the dot-joined paths to each leaf.

- `{ a: { b: "x" }, c: "y" }` -> `{ "a.b": "x", c: "y" }`
- `{ a: {} }` -> `{}`

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex7
```

## ex8 - diff two records

`diffMeta(before, after)` returns `{ added, removed, changed }`, each an
alphabetically sorted array of keys. A key is *changed* when it exists on both
sides with values that are not strictly equal.

- `diffMeta({ a: "1", b: "2", c: "3" }, { b: "2", c: "changed", d: "4" })`
  -> `{ added: ["d"], removed: ["a"], changed: ["c"] }`
- `diffMeta({ n: 1 }, { n: "1" })` -> `{ added: [], removed: [], changed: ["n"] }`

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d03_objects_shapes ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d03_objects_shapes. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { trackLine } from "./ex1/solution";
import { describeAlbum } from "./ex2/solution";
import { addTrack } from "./ex3/solution";
import { contactLine } from "./ex4/solution";
import { byArtist } from "./ex5/solution";
import { presentTags } from "./ex6/solution";
import { flattenMeta } from "./ex7/solution";
import { diffMeta } from "./ex8/solution";

describe("d03_objects_shapes", () => {
  test("ex1 - trackLine() renders one track, explicit or not", () => {
    expect(
      trackLine({ title: "Praise You", artist: "Fatboy Slim", seconds: 337 }),
      "title, a spaced dash, artist, then the seconds in brackets",
    ).toBe("Praise You - Fatboy Slim (337s)");
    expect(
      trackLine({ title: "Rockafeller Skank", artist: "Fatboy Slim", seconds: 415, explicit: true }),
      "an explicit track gets a trailing [E]",
    ).toBe("Rockafeller Skank - Fatboy Slim (415s) [E]");
    expect(
      trackLine({ title: "Gangster Trippin", artist: "Fatboy Slim", seconds: 300, explicit: false }),
      "explicit: false renders exactly like a missing explicit - reread README ex1",
    ).toBe("Gangster Trippin - Fatboy Slim (300s)");
  });

  test("ex2 - describeAlbum() defaults the label but not the year", () => {
    expect(
      describeAlbum({ title: "Homework" }),
      "no label means independent, no year means the word unknown",
    ).toBe("Homework [independent] unknown");
    expect(
      describeAlbum({ title: "Homework", year: 1997, label: "Virgin" }),
      "both supplied, both used",
    ).toBe("Homework [Virgin] 1997");
    expect(
      describeAlbum({ title: "Bootleg", year: 0 }),
      "year 0 is a value the caller gave you: a default applies to undefined only, " +
        "so || would be wrong here (README ex2)",
    ).toBe("Bootleg [independent] 0");
    expect(
      describeAlbum({ title: "Bootleg", label: "" }),
      "and an explicitly empty label is not a missing label either",
    ).toBe("Bootleg [] unknown");
  });

  test("ex3 - addTrack() returns a new playlist", () => {
    const playlist = { id: "p1", name: "Big Beat", tracks: ["Praise You"] };
    const grown = addTrack(playlist, "Right Here Right Now");
    expect(grown.tracks, "the new title is appended at the end").toEqual([
      "Praise You",
      "Right Here Right Now",
    ]);
    expect(grown.name, "everything else is copied across").toBe("Big Beat");
    expect(grown.id, "including the id").toBe("p1");
    expect(
      playlist.tracks,
      "the playlist you were handed still has one track - spread into a new " +
        "array, never push into the old one",
    ).toEqual(["Praise You"]);
    expect(grown, "the result is a different object").not.toBe(playlist);
    expect(grown.tracks, "and a different array").not.toBe(playlist.tracks);
  });

  test("ex4 - contactLine() walks two optional levels", () => {
    expect(
      contactLine({ name: "Mix" }),
      "no owner at all: anonymous, and no email",
    ).toBe("anonymous <no email>");
    expect(
      contactLine({ name: "Mix", owner: {} }),
      "an owner object with nothing in it is the same answer",
    ).toBe("anonymous <no email>");
    expect(
      contactLine({ name: "Mix", owner: { name: "Ada" } }),
      "a name but no contact object",
    ).toBe("Ada <no email>");
    expect(
      contactLine({ name: "Mix", owner: { name: "Ada", contact: {} } }),
      "a contact object with no email in it",
    ).toBe("Ada <no email>");
    expect(
      contactLine({ name: "Mix", owner: { name: "Ada", contact: { email: "ada@example.com" } } }),
      "both levels present",
    ).toBe("Ada <ada@example.com>");
    expect(
      contactLine({ name: "Mix", owner: { name: "  ", contact: { email: "  " } } }),
      "whitespace-only values count as missing - reread README ex4",
    ).toBe("anonymous <no email>");
  });

  test("ex5 - byArtist() builds a nested tally", () => {
    expect(
      byArtist([
        { artist: "Air", seconds: 100 },
        { artist: "Orbital", seconds: 200 },
        { artist: "Air", seconds: 50 },
      ]),
      "one entry per artist, each with a count and a total of seconds",
    ).toEqual({
      Air: { count: 2, seconds: 150 },
      Orbital: { count: 1, seconds: 200 },
    });
    expect(byArtist([]), "no tracks means an empty object, not undefined").toEqual({});
    expect(
      byArtist([{ artist: "Air", seconds: 0 }]),
      "a zero-second track still counts as a track",
    ).toEqual({ Air: { count: 1, seconds: 0 } });
  });

  test("ex6 - presentTags() keeps only the tags that are really there", () => {
    expect(
      presentTags({ genre: "house", mood: "", era: undefined }),
      "an empty string and an undefined are both absent tags",
    ).toEqual({ genre: "house" });
    expect(presentTags({}), "nothing in, nothing out").toEqual({});
    expect(
      presentTags({ genre: "  house  ", mood: "   " }),
      "surviving values are trimmed, and a whitespace-only value does not survive",
    ).toEqual({ genre: "house" });
    expect(
      Object.keys(presentTags({ genre: "house", mood: "calm", era: "90s" })),
      "when everything is present, everything is kept",
    ).toEqual(["genre", "mood", "era"]);
  });

  test("ex7 - flattenMeta() joins nested keys with dots", () => {
    expect(
      flattenMeta({ a: { b: "x" }, c: "y" }),
      "a nested key becomes a dotted path; a top-level one is unchanged",
    ).toEqual({ "a.b": "x", c: "y" });
    expect(flattenMeta({ a: { b: { c: "z" } } }), "the nesting can go as deep as it likes").toEqual({
      "a.b.c": "z",
    });
    expect(flattenMeta({}), "an empty tree flattens to an empty object").toEqual({});
    expect(
      flattenMeta({ a: {} }),
      "a branch with no leaves contributes nothing at all - not a key with an " +
        "empty object under it (README ex7)",
    ).toEqual({});
    expect(
      flattenMeta({ mix: { deep: { one: "1", two: "2" }, flat: "3" } }),
      "several leaves under one branch each get their own full path",
    ).toEqual({ "mix.deep.one": "1", "mix.deep.two": "2", "mix.flat": "3" });
  });

  test("ex8 - diffMeta() reports added, removed and changed keys", () => {
    expect(
      diffMeta({ a: "1", b: "2", c: "3" }, { b: "2", c: "changed", d: "4" }),
      "d is new, a is gone, c has a different value, b is untouched",
    ).toEqual({ added: ["d"], removed: ["a"], changed: ["c"] });
    expect(diffMeta({}, {}), "two empty records still return three empty arrays").toEqual({
      added: [],
      removed: [],
      changed: [],
    });
    expect(
      diffMeta({ n: 1 }, { n: "1" }),
      "the comparison is strict, so 1 and the text 1 are a change",
    ).toEqual({ added: [], removed: [], changed: ["n"] });
    expect(
      diffMeta({}, { z: "1", a: "2" }),
      "every list comes back sorted alphabetically, whatever the key order was",
    ).toEqual({ added: ["a", "z"], removed: [], changed: [] });
    expect(
      diffMeta({ same: 7 }, { same: 7 }),
      "an unchanged key appears in none of the three lists",
    ).toEqual({ added: [], removed: [], changed: [] });
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d03_objects_shapes. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Track } from "./ex1/solution";
import { trackLine } from "./ex1/solution";
import type { AlbumInput } from "./ex2/solution";
import { describeAlbum } from "./ex2/solution";
import type { Playlist } from "./ex3/solution";
import { addTrack } from "./ex3/solution";
import type { OwnedPlaylist } from "./ex4/solution";
import { contactLine } from "./ex4/solution";
import type { ArtistTotals } from "./ex5/solution";
import { byArtist } from "./ex5/solution";
import { presentTags } from "./ex6/solution";
import type { MetaTree } from "./ex7/solution";
import { flattenMeta } from "./ex7/solution";
import { diffMeta } from "./ex8/solution";

describe("d03_objects_shapes", () => {
  test("ex1 - Track has three required members and one optional flag", () => {
    const track: Track = { title: "Praise You", artist: "Fatboy Slim", seconds: 337 };
    expectTypeOf(track.seconds).toEqualTypeOf<number>();
    expectTypeOf<Track["explicit"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf(trackLine).returns.toEqualTypeOf<string>();
    // @ts-expect-error - a track needs an artist.
    const wrong: Track = { title: "Praise You", seconds: 337 };
  });

  test("ex2 - AlbumInput has one required member and two optional ones", () => {
    expectTypeOf<AlbumInput["title"]>().toEqualTypeOf<string>();
    expectTypeOf<AlbumInput["year"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<AlbumInput["label"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf(describeAlbum).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the title is not optional.
    describeAlbum({ year: 1997 });
  });

  test("ex3 - Playlist is readonly where it matters", () => {
    const playlist: Playlist = { id: "p1", name: "Big Beat", tracks: ["Praise You"] };
    expectTypeOf(addTrack(playlist, "x")).toEqualTypeOf<Playlist>();
    playlist.name = "renamed";
    // @ts-expect-error - the id is readonly.
    playlist.id = "p2";
    // @ts-expect-error - tracks is a readonly array, so push is not on it.
    playlist.tracks.push("late");
  });

  test("ex4 - OwnedPlaylist nests two optional levels", () => {
    const playlist: OwnedPlaylist = { name: "Mix" };
    expectTypeOf(contactLine(playlist)).toEqualTypeOf<string>();
    // @ts-expect-error - owner is optional, so it cannot be read without a check.
    playlist.owner.name;
  });

  test("ex5 - ArtistTotals is an index signature over totals", () => {
    const totals: ArtistTotals = { Air: { count: 1, seconds: 10 } };
    expectTypeOf(totals["anyone at all"]).toEqualTypeOf<{ count: number; seconds: number }>();
    expectTypeOf(byArtist([])).toEqualTypeOf<ArtistTotals>();
    // @ts-expect-error - the values are totals, not plain counts.
    const wrong: ArtistTotals = { Air: 1 };
  });

  test("ex6 - presentTags() promises a string for every key it keeps", () => {
    expectTypeOf(presentTags({})).toEqualTypeOf<Record<string, string>>();
    // @ts-expect-error - a genre is a string.
    presentTags({ genre: 1 });
  });

  test("ex7 - MetaTree is recursive", () => {
    const tree: MetaTree = { a: { b: { c: "deep" } }, d: "shallow" };
    expectTypeOf<MetaTree[string]>().toEqualTypeOf<string | MetaTree>();
    expectTypeOf(flattenMeta(tree)).toEqualTypeOf<Record<string, string>>();
    // @ts-expect-error - a leaf is a string, never a number.
    const wrong: MetaTree = { a: 1 };
  });

  test("ex8 - diffMeta() returns exactly three string arrays", () => {
    expectTypeOf(diffMeta({}, {})).toEqualTypeOf<{
      added: string[];
      removed: string[];
      changed: string[];
    }>();
    // @ts-expect-error - metadata values are strings or numbers.
    diffMeta({ a: true }, {});
  });
});
```

An exercise is green only when both gates agree about it.
