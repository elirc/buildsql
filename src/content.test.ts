// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  boundedJson,
  loadTrack,
  validateIndex,
  validateTrack,
} from "./content-loader";
import { TRACKS } from "./contracts";
const read = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`../public/content/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
describe("actual preserved curriculum contracts", () => {
  it("reconciles the complete index with the checked-in catalog", () => {
    expect(validateIndex(read("index")).exerciseCount).toBe(2155);
  });
  for (const id of TRACKS)
    it(`validates every lesson and mission in the preserved ${id} pack`, () => {
      expect(validateTrack(read(id), id).id).toBe(id);
    });
  it("rejects index path traversal and duplicate tracks", () => {
    const a = read("index");
    a.tracks[0].pack = "/other.json";
    expect(() => validateIndex(a)).toThrow();
    const b = read("index");
    b.tracks[1] = b.tracks[0];
    expect(() => validateIndex(b)).toThrow();
  });
  it("rejects missing missions and altered curriculum rewards", () => {
    const a = read("dotnet");
    a.lessons[0].exercises.pop();
    expect(() => validateTrack(a, "dotnet")).toThrow();
    const b = read("dotnet");
    b.lessons[0].exercises[0].xp = 9000;
    expect(() => validateTrack(b, "dotnet")).toThrow();
  });
  it("rejects unknown selected tracks before fetching any path", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(loadTrack("../private")).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it("bounds streamed JSON and reports unsuccessful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("x".repeat(100))),
    );
    await expect(boundedJson("/fixture", 50)).rejects.toThrow(/limit/);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("missing", { status: 404 })),
    );
    await expect(boundedJson("/fixture", 500)).rejects.toThrow(/404/);
    vi.unstubAllGlobals();
  });
});
