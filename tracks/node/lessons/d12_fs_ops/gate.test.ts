// Gate for node/d12_fs_ops. Quoted verbatim in README.md.
//
// Every test that touches the disk gets its own fresh directory under the OS
// temp dir, removed afterwards - nothing is ever written inside the repo. Every
// assertion about a path is built with node:path, and every path a solution
// RETURNS is compared with forward slashes, so these gates hold on Windows and
// on Linux alike.
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { writeTextAtomic } from "./ex1/solution";
import { copyTree } from "./ex2/solution";
import { dirStats } from "./ex3/solution";
import { removeEmptyDirs } from "./ex4/solution";
import { appendJsonl, readJsonl } from "./ex5/solution";
import { withTempWorkspace } from "./ex6/solution";
import { syncDirectories } from "./ex7/solution";
import { findDuplicates } from "./ex8/solution";

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-d12-"));
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

describe("d12_fs_ops", () => {
  test("ex1 - writeTextAtomic() leaves the target complete and the directory clean", async () => {
    await withTempDir(async (dir) => {
      const file = path.join(dir, "reports", "2026", "q1.txt");

      await writeTextAtomic(file, "first");
      expect(await readFile(file, "utf8"), "the contents arrive").toBe("first");
      expect(
        await readdir(path.dirname(file)),
        "the parent directories are created on the way, and nothing else is " +
          "left behind - a temp file that survives the write is a temp file " +
          "somebody will eventually ship",
      ).toEqual(["q1.txt"]);

      await writeTextAtomic(file, "second");
      expect(await readFile(file, "utf8"), "and a second write replaces it").toBe(
        "second",
      );
      expect(await readdir(path.dirname(file)), "still just the one file").toEqual([
        "q1.txt",
      ]);
    });

    await withTempDir(async (dir) => {
      const file = path.join(dir, "concurrent.txt");
      const a = "a".repeat(2_000);
      const b = "b".repeat(2_000);
      await Promise.all([writeTextAtomic(file, a), writeTextAtomic(file, b)]);

      const contents = await readFile(file, "utf8");
      expect(
        contents === a || contents === b,
        "two writers at once must leave one COMPLETE value, never a mixture. " +
          "That is what the rename buys you: a reader sees the old file or the " +
          "new one, and never a half-written one",
      ).toBe(true);
      expect(
        await readdir(dir),
        "and both temporary names have to be distinct, or one writer renames " +
          "the other writer file out from under it and the second rename fails",
      ).toEqual(["concurrent.txt"]);
    });
  });

  test("ex2 - copyTree() walks the tree and honours the exclusions", async () => {
    await withTempDir(async (root) => {
      const src = path.join(root, "src");
      const dest = path.join(root, "dest");

      await writeFileIn(src, "a.txt", "A");
      await writeFileIn(src, "nested/b.txt", "B");
      await writeFileIn(src, "nested/deep/c.txt", "C");
      await writeFileIn(src, "node_modules/big.txt", "X");
      await writeFileIn(src, "secret.key", "S");

      const copied = await copyTree(src, dest, {
        skip: (relative) => relative === "node_modules" || relative.endsWith(".key"),
      });

      expect(
        copied,
        "the files that were copied, relative to the source, with forward " +
          "slashes, sorted - a Windows backslash in a returned path is a bug " +
          "that only shows up on somebody else machine",
      ).toEqual(["a.txt", "nested/b.txt", "nested/deep/c.txt"]);

      expect(
        await readFile(path.join(dest, "nested", "deep", "c.txt"), "utf8"),
        "and the contents really are there, at the same depth",
      ).toBe("C");
      expect(
        existsSync(path.join(dest, "node_modules")),
        "skipping a DIRECTORY skips everything under it - and does not even " +
          "create it, which is the difference between pruning and filtering",
      ).toBe(false);
      expect(existsSync(path.join(dest, "secret.key")), "a skipped file too").toBe(false);

      const emptySrc = path.join(root, "nothing");
      await mkdir(emptySrc, { recursive: true });
      expect(
        await copyTree(emptySrc, path.join(root, "nothing-copy")),
        "an empty tree copies nothing, and skip is optional",
      ).toEqual([]);
    });
  });

  test("ex3 - dirStats() counts what is really there", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "a.txt", "12345");
      await writeFileIn(dir, "nested/b.txt", "1234567890");
      await writeFileIn(dir, "nested/deep/c.txt", "1");
      await mkdir(path.join(dir, "nested", "empty"), { recursive: true });

      expect(
        await dirStats(dir),
        "three files at three depths, 5 + 10 + 1 bytes. Directories are not " +
          "files: they must not be counted, and their own size on disk is not " +
          "part of the answer",
      ).toEqual({ files: 3, bytes: 16 });

      expect(
        await dirStats(path.join(dir, "nested", "deep")),
        "the same call further down reports only that subtree",
      ).toEqual({ files: 1, bytes: 1 });

      expect(
        await dirStats(path.join(dir, "nested", "empty")),
        "an empty directory is zero of both, not a failure",
      ).toEqual({ files: 0, bytes: 0 });
    });
  });

  test("ex4 - removeEmptyDirs() prunes from the bottom up", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "keep/a.txt", "A");
      await mkdir(path.join(dir, "empty"), { recursive: true });
      await mkdir(path.join(dir, "keep", "alsoempty"), { recursive: true });
      await mkdir(path.join(dir, "outer", "inner"), { recursive: true });

      const removed = await removeEmptyDirs(dir);
      expect(
        removed,
        "outer only becomes empty once inner is gone, so it has to be removed " +
          "AFTER it - a top-down walk reports outer as non-empty and stops",
      ).toEqual(["empty", "keep/alsoempty", "outer", "outer/inner"]);

      expect(
        existsSync(path.join(dir, "keep", "a.txt")),
        "a directory with a file in it is not empty",
      ).toBe(true);
      expect(existsSync(path.join(dir, "outer")), "and the pruned ones are gone").toBe(
        false,
      );
      expect(
        existsSync(dir),
        "the root is never removed, even when it ends up empty - the caller " +
          "gave you that directory and may still be standing in it",
      ).toBe(true);

      expect(
        await removeEmptyDirs(dir),
        "running it again finds nothing left to do rather than failing",
      ).toEqual([]);
    });
  });

  test("ex5 - the jsonl log appends, reads back, and names the broken line", async () => {
    await withTempDir(async (dir) => {
      const file = path.join(dir, "logs", "events.jsonl");

      expect(
        await readJsonl(file),
        "a log nobody has written to yet is empty, not an error - ENOENT is " +
          "the one failure that means nothing has happened",
      ).toEqual([]);

      await appendJsonl(file, { event: "signup", id: 1 });
      await appendJsonl(file, { event: "login", id: 2 });

      const raw = await readFile(file, "utf8");
      expect(
        raw,
        "one compact JSON object per line, each ending in a newline - that is " +
          "the whole format, and it is what makes it appendable",
      ).toBe('{"event":"signup","id":1}\n{"event":"login","id":2}\n');
      expect(
        await readJsonl(file),
        "and it reads back as the records that went in",
      ).toEqual([
        { event: "signup", id: 1 },
        { event: "login", id: 2 },
      ]);

      await writeFile(file, '{"a":1}\n\n{"b":2}\n', "utf8");
      expect(
        await readJsonl(file),
        "a blank line is not a record. Skipping them is what makes the trailing " +
          "newline harmless",
      ).toEqual([{ a: 1 }, { b: 2 }]);

      await writeFile(file, '{"a":1}\n{"b":2}\n{ not json\n', "utf8");
      await expect(
        readJsonl(file),
        "and a corrupt line names its LINE NUMBER, counting from one, because " +
          "the alternative is a stack trace about position 2 of a file with " +
          "four million of them",
      ).rejects.toThrow("invalid JSON on line 3");
    });
  });

  test("ex6 - withTempWorkspace() always takes its directory away again", async () => {
    let captured = "";
    const value = await withTempWorkspace(async (dir) => {
      captured = dir;
      expect(existsSync(dir), "the directory exists while the work runs").toBe(true);
      await writeFile(path.join(dir, "scratch.txt"), "working", "utf8");
      return 42;
    });

    expect(value, "the value comes back through").toBe(42);
    const relative = path.relative(tmpdir(), captured);
    expect(
      relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative),
      "the workspace lives under the OS temp directory. Anywhere inside the " +
        "repository is wrong: a crashed test then leaves rubbish in somebody " +
        "working tree",
    ).toBe(true);
    expect(
      existsSync(captured),
      "and it is gone afterwards, contents and all",
    ).toBe(false);

    let failedDir = "";
    await expect(
      withTempWorkspace(async (dir) => {
        failedDir = dir;
        await writeFile(path.join(dir, "half-done.txt"), "oops", "utf8");
        throw new Error("the work failed");
      }),
      "a failure inside the work reaches the caller unchanged",
    ).rejects.toThrow("the work failed");
    expect(
      existsSync(failedDir),
      "and the cleanup still happened - which is the entire reason this helper " +
        "exists rather than two lines at each call site",
    ).toBe(false);

    const first = await withTempWorkspace(async (dir) => dir);
    const second = await withTempWorkspace(async (dir) => dir);
    expect(
      first,
      "two workspaces are never the same directory, even back to back",
    ).not.toBe(second);
  });

  test("ex7 - syncDirectories() makes the destination match, and says what it did", async () => {
    await withTempDir(async (root) => {
      const src = path.join(root, "src");
      const dest = path.join(root, "dest");

      await writeFileIn(src, "a.txt", "A");
      await writeFileIn(src, "nested/b.txt", "BB");
      await writeFileIn(src, "same.txt", "SAME");

      await writeFileIn(dest, "nested/b.txt", "B");
      await writeFileIn(dest, "same.txt", "SAME");
      await writeFileIn(dest, "extra.txt", "X");
      await writeFileIn(dest, "old/gone.txt", "G");

      expect(
        await syncDirectories(src, dest),
        "three buckets, all relative with forward slashes and sorted: new " +
          "files copied, differing files updated, and files the source no " +
          "longer has deleted. A file that matches is in none of them",
      ).toEqual({
        copied: ["a.txt"],
        updated: ["nested/b.txt"],
        deleted: ["extra.txt", "old/gone.txt"],
      });

      expect(await readFile(path.join(dest, "a.txt"), "utf8"), "the new file").toBe("A");
      expect(
        await readFile(path.join(dest, "nested", "b.txt"), "utf8"),
        "the updated one really was overwritten",
      ).toBe("BB");
      expect(
        await readFile(path.join(dest, "same.txt"), "utf8"),
        "and the matching one was left alone",
      ).toBe("SAME");
      expect(existsSync(path.join(dest, "extra.txt")), "the extra one is gone").toBe(
        false,
      );

      expect(
        await syncDirectories(src, dest),
        "running it again does nothing at all. A sync that is not idempotent " +
          "is a sync that rewrites your whole bucket every night",
      ).toEqual({ copied: [], updated: [], deleted: [] });
    });
  });

  test("ex8 - findDuplicates() groups files by what is in them", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "a.txt", "same content");
      await writeFileIn(dir, "nested/b.txt", "same content");
      await writeFileIn(dir, "c.txt", "unique");
      await writeFileIn(dir, "e.txt", "other pair");
      await writeFileIn(dir, "nested/deep/d.txt", "other pair");

      expect(
        await findDuplicates(dir),
        "one group per set of identical files, members sorted, groups ordered " +
          "by their first member - and a file with no twin is not a group of " +
          "one",
      ).toEqual([
        ["a.txt", "nested/b.txt"],
        ["e.txt", "nested/deep/d.txt"],
      ]);
    });

    await withTempDir(async (dir) => {
      await writeFileIn(dir, "only.txt", "alone");
      await writeFileIn(dir, "other.txt", "also alone");
      expect(
        await findDuplicates(dir),
        "nothing duplicated, nothing reported - a file with no twin is not a " +
          "group of one",
      ).toEqual([]);

      await writeFileIn(dir, "x/1.txt", "three of these");
      await writeFileIn(dir, "y/2.txt", "three of these");
      await writeFileIn(dir, "3.txt", "three of these");
      expect(
        await findDuplicates(dir),
        "a group can be any size, and grouping by CONTENT means the names and " +
          "the directories are irrelevant",
      ).toEqual([["3.txt", "x/1.txt", "y/2.txt"]]);

      const empty = path.join(dir, "nothing");
      await mkdir(empty, { recursive: true });
      expect(await findDuplicates(empty), "an empty tree has no duplicates").toEqual([]);
    });
  });
});
