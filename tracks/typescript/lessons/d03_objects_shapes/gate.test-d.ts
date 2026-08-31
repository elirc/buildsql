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
