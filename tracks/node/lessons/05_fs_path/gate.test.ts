// Gate for node/05_fs_path. Quoted verbatim in README.md.
//
// Every test that touches the disk does so inside a fresh directory under the
// OS temp dir, removed afterwards. Nothing is ever written inside the repo,
// and every assertion about a path is built with node:path so it holds on
// Windows and on Linux alike.
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { isInside, reportPath, splitName } from "./ex1/solution";
import { readJson, writeJson } from "./ex2/solution";
import { listJsonFiles } from "./ex3/solution";
import { readJsonOr } from "./ex4/solution";
import { buildIndex } from "./challenge/solution";
import { ensureUniqueName } from "./review1/solution";

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-fs-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function writeFileIn(dir: string, relative: string, contents: string): Promise<string> {
  const file = path.join(dir, ...relative.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, "utf8");
  return file;
}

describe("05_fs_path", () => {
  test("ex1 - paths are built and inspected with node:path, never with strings", () => {
    const root = path.join(tmpdir(), "srv");
    expect(
      reportPath(root, "01_modules", "README.md"),
      "join the segments with node:path so the separator is right for the " +
        "platform: on Windows that is a backslash, and a hard-coded / is a bug " +
        "that only shows up on someone else's machine",
    ).toBe([root, "01_modules", "README.md"].join(path.sep));

    expect(
      reportPath(root + path.sep, "01_modules", "README.md"),
      "a trailing separator on the root must not produce a doubled separator " +
        "- the right function normalises this for you",
    ).toBe([root, "01_modules", "README.md"].join(path.sep));

    expect(
      splitName("report.2026.json"),
      "the extension is the LAST dot onwards, and the name is everything " +
        "before it - node:path knows this rule, you should not reimplement it",
    ).toEqual({ name: "report.2026", ext: ".json" });
    expect(
      splitName("LICENSE"),
      "a file with no dot has an empty extension, not undefined",
    ).toEqual({ name: "LICENSE", ext: "" });

    const base = path.join(tmpdir(), "uploads");
    expect(
      isInside(base, path.join(base, "avatars", "1.png")),
      "a path below the base directory is inside it",
    ).toBe(true);
    expect(
      isInside(base, path.join(base, "..", "etc", "passwd")),
      "this is the path traversal attack in one line: a user-supplied " +
        '"../.." must be rejected. Resolve first, then compare (README ex1)',
    ).toBe(false);
    expect(
      isInside(base, base),
      "the base directory is not inside itself",
    ).toBe(false);
  });

  test("ex2 - writeJson()/readJson() round-trip through a directory that did not exist", async () => {
    await withTempDir(async (dir) => {
      const file = path.join(dir, "reports", "2026", "q1.json");
      await writeJson(file, { revenue: 12, currency: "EUR" });

      const raw = await readFile(file, "utf8");
      expect(
        raw.endsWith("\n"),
        "end the file with a newline: every other unix tool assumes it, and " +
          "git will tell you off forever if you do not",
      ).toBe(true);
      expect(
        raw,
        "write it indented with two spaces (JSON.stringify takes that as its " +
          "third argument) so a human can read the diff",
      ).toContain('\n  "revenue": 12');

      expect(
        await readJson(file),
        "readJson() gives back exactly what writeJson() put in",
      ).toEqual({ revenue: 12, currency: "EUR" });
    });
  });

  test("ex3 - listJsonFiles() walks the tree and reports portable relative paths", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "a.json", "{}");
      await writeFileIn(dir, "notes.txt", "not json");
      await writeFileIn(dir, "nested/b.json", "{}");
      await writeFileIn(dir, "nested/deep/c.json", "{}");
      await writeFileIn(dir, "nested/deep/skip.md", "# no");

      expect(
        await listJsonFiles(dir),
        "recurse into every subdirectory, keep only .json files, return the " +
          "paths RELATIVE to the directory you were given, with forward " +
          "slashes, sorted",
      ).toEqual(["a.json", "nested/b.json", "nested/deep/c.json"]);

      expect(
        await listJsonFiles(path.join(dir, "nested", "deep")),
        "the same call one level down returns paths relative to THAT directory",
      ).toEqual(["c.json"]);
    });
  });

  test("ex4 - readJsonOr() knows the difference between missing and broken", async () => {
    await withTempDir(async (dir) => {
      const missing = path.join(dir, "settings.json");
      expect(
        await readJsonOr(missing, { theme: "dark" }),
        "a file that is not there is not an error here - that is what the " +
          "fallback is for",
      ).toEqual({ theme: "dark" });

      await writeFileIn(dir, "settings.json", '{"theme":"light"}');
      expect(
        await readJsonOr(missing, { theme: "dark" }),
        "once the file exists, its contents win over the fallback",
      ).toEqual({ theme: "light" });

      const broken = await writeFileIn(dir, "broken.json", "{ not json");
      await expect(
        readJsonOr(broken, { theme: "dark" }),
        "a corrupt file is NOT a missing file. Returning the fallback here " +
          "would hide real damage - only ENOENT gets the fallback treatment",
      ).rejects.toThrow();
    });
  });

  test("challenge - buildIndex() reads a tree, writes a summary and reports the damage", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "posts/b.json", '{"id":"b","title":"Backpressure"}');
      await writeFileIn(dir, "posts/a.json", '{"id":"a","title":"Async"}');
      await writeFileIn(dir, "posts/deep/c.json", '{"id":"c","title":"Cause"}');
      await writeFileIn(dir, "posts/readme.md", "ignored");

      const index = await buildIndex(path.join(dir, "posts"));
      expect(
        index,
        "one entry per .json file, sorted by id - and index.json itself must " +
          "not appear (you write it after you read, or you skip it)",
      ).toEqual([
        { id: "a", title: "Async" },
        { id: "b", title: "Backpressure" },
        { id: "c", title: "Cause" },
      ]);

      const written = JSON.parse(
        await readFile(path.join(dir, "posts", "index.json"), "utf8"),
      );
      expect(
        written,
        "index.json holds the same array you returned",
      ).toEqual(index);
    });

    await withTempDir(async (dir) => {
      await writeFileIn(dir, "ok.json", '{"id":"a","title":"Fine"}');
      await writeFileIn(dir, "nested/bad.json", "{ oops");

      const failure = await buildIndex(dir).then(
        () => undefined,
        (error: unknown) => error as Error,
      );
      expect(
        failure,
        "one malformed file must fail the whole build - a half-written index " +
          "is worse than no index",
      ).toBeInstanceOf(Error);
      expect(
        failure?.message,
        "and the message has to name the file, or whoever gets paged at 3am " +
          "has to guess which of 900 files it was",
      ).toContain("nested/bad.json");
    });
  });

  test("review1 - ensureUniqueName() never overwrites what is already there", async () => {
    await withTempDir(async (dir) => {
      expect(
        await ensureUniqueName(dir, "report.json"),
        "nothing is in the way, so the name is returned unchanged",
      ).toBe("report.json");

      await writeFileIn(dir, "report.json", "{}");
      expect(
        await ensureUniqueName(dir, "report.json"),
        "the suffix goes before the extension, not after it: report-1.json, " +
          "never report.json-1",
      ).toBe("report-1.json");

      await writeFileIn(dir, "report-1.json", "{}");
      await writeFileIn(dir, "report-2.json", "{}");
      expect(
        await ensureUniqueName(dir, "report.json"),
        "keep counting until you find a free name",
      ).toBe("report-3.json");

      await writeFileIn(dir, "LICENSE", "");
      expect(
        await ensureUniqueName(dir, "LICENSE"),
        "a file with no extension still gets a suffix",
      ).toBe("LICENSE-1");
    });
  });
});
