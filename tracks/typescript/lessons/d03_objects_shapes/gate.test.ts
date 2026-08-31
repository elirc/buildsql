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
