// Gate for node/d13_path_portability. Quoted verbatim in README.md.
//
// Nothing here touches the disk: these are pure functions over path strings.
// Every path the gate builds comes from node:path, so the same assertions hold
// on Windows and on Linux, and every path a solution RETURNS as a URL-shaped
// string is compared with forward slashes.
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { relativeUrlPath } from "./ex1/solution";
import { changeExtension } from "./ex2/solution";
import { safeJoin } from "./ex3/solution";
import { commonAncestor } from "./ex4/solution";
import { resolveDocLink } from "./ex5/solution";
import { outputPathFor } from "./ex6/solution";
import { matchesGlob } from "./ex7/solution";
import { shortestUniqueLabels } from "./ex8/solution";

/** An absolute directory that exists on paper only - nothing is ever created. */
const root = path.join(tmpdir(), "dojo-d13");

describe("d13_path_portability", () => {
  test("ex1 - relativeUrlPath() answers in the separator the web uses", () => {
    const docs = path.join(root, "docs");

    expect(
      relativeUrlPath(docs, path.join(docs, "guide", "intro.md")),
      "a file below the directory is named relative to it, with forward " +
        "slashes. path.relative() gives you backslashes on Windows, and a " +
        "backslash in an href is not a separator - it is a character in the " +
        "filename as far as the browser is concerned",
    ).toBe("guide/intro.md");

    expect(
      relativeUrlPath(path.join(docs, "api"), path.join(docs, "guide", "intro.md")),
      "a sibling directory is reached by going up first",
    ).toBe("../guide/intro.md");

    expect(
      relativeUrlPath(docs, path.join(docs, "index.md")),
      "a file directly inside is just its name - no leading ./",
    ).toBe("index.md");

    expect(
      relativeUrlPath(docs, docs),
      "the directory relative to itself is a dot. path.relative() returns the " +
        "empty string here, and an empty href means the current page in some " +
        "browsers and nothing at all in others",
    ).toBe(".");
  });

  test("ex2 - changeExtension() replaces the last extension and nothing else", () => {
    expect(
      changeExtension("report.2026.json", ".md"),
      "the extension is the LAST dot onwards; report.2026 is the name and it " +
        "keeps its dot",
    ).toBe("report.2026.md");

    expect(
      changeExtension(path.join("site", "pages", "notes.txt"), "md"),
      "the new extension may arrive without its dot, and the directory in " +
        "front of the file is untouched",
    ).toBe(path.join("site", "pages", "notes.md"));

    expect(
      changeExtension("LICENSE", ".txt"),
      "a file with no extension gains one rather than being renamed",
    ).toBe("LICENSE.txt");

    expect(
      changeExtension("archive.tar.gz", ""),
      "an empty extension removes one level, and only one - .tar is still an " +
        "extension and archive.tar is still the answer",
    ).toBe("archive.tar");

    expect(
      changeExtension(path.join(root, "q1.csv"), ".json"),
      "an absolute path stays absolute",
    ).toBe(path.join(root, "q1.json"));
  });

  test("ex3 - safeJoin() refuses to leave the directory it was given", () => {
    const uploads = path.join(root, "uploads");

    expect(
      safeJoin(uploads, "avatars", "42.png"),
      "the ordinary case: the segments are joined under the root and the " +
        "answer is absolute",
    ).toBe(path.join(uploads, "avatars", "42.png"));

    expect(
      safeJoin(uploads, "avatars", "..", "logos", "brand.svg"),
      "a .. that cancels out inside the root is not an escape - normalise " +
        "first, then judge the result",
    ).toBe(path.join(uploads, "logos", "brand.svg"));

    expect(
      safeJoin(uploads, "..", "..", "etc", "passwd"),
      "and the attack itself: a client-supplied .. that climbs out has to come " +
        "back as null, never as a path you then open",
    ).toBeNull();

    expect(
      safeJoin(uploads, path.join(path.sep, "etc", "passwd")),
      "an ABSOLUTE segment is the same attack in a different shape. " +
        "path.resolve() throws away everything to the left of it, which is " +
        "exactly what the attacker wants",
    ).toBeNull();

    expect(
      safeJoin(uploads, "..config", "keep.json"),
      "a segment that merely STARTS with two dots is an ordinary directory. " +
        "Testing the relative path with startsWith(..) rejects it, and that is " +
        "the bug this assertion exists to catch - compare segments, not prefixes",
    ).toBe(path.join(uploads, "..config", "keep.json"));

    expect(
      safeJoin(uploads),
      "no segments at all resolves to the root itself, which is inside itself " +
        "for this purpose",
    ).toBe(path.resolve(uploads));
  });

  test("ex4 - commonAncestor() compares segments, not characters", () => {
    const project = path.join(root, "project");

    expect(
      commonAncestor([
        path.join(project, "src", "index.ts"),
        path.join(project, "src", "nested", "deep.ts"),
      ]),
      "the deepest directory both files live under",
    ).toBe(path.join(project, "src"));

    expect(
      commonAncestor([path.join(project, "var", "log"), path.join(project, "var", "logging")]),
      "the classic mistake in one assertion: the longest common STRING prefix " +
        "of these two is .../var/log, which is not an ancestor of " +
        ".../var/logging at all. Walk the segments",
    ).toBe(path.join(project, "var"));

    expect(
      commonAncestor([
        path.join(project, "a", "one.ts"),
        path.join(project, "b", "two.ts"),
        path.join(project, "c", "three.ts"),
      ]),
      "three inputs narrow it further than two - every path has to agree",
    ).toBe(project);

    expect(
      commonAncestor([path.join(project, "only.ts")]),
      "one path is its own ancestor here: there is nothing to disagree with it",
    ).toBe(path.join(project, "only.ts"));

    expect(
      commonAncestor(["site/pages/a.md", "site/pages/b.md"]),
      "relative inputs are resolved against the working directory first, " +
        "because two relative paths cannot be compared until they mean " +
        "something",
    ).toBe(path.resolve("site", "pages"));

    expect(commonAncestor([]), "no paths, no ancestor").toBeNull();
  });

  test("ex5 - resolveDocLink() follows the links a document can actually follow", () => {
    const intro = path.join(root, "docs", "guide", "intro.md");

    expect(
      resolveDocLink(intro, "../api/reference.md#usage"),
      "the link is relative to the DIRECTORY the document is in, not to the " +
        "document, and the fragment is not part of the filename",
    ).toBe(path.join(root, "docs", "api", "reference.md"));

    expect(
      resolveDocLink(path.join(root, "docs", "index.md"), "guide/intro.md"),
      "a plain relative link, written with forward slashes as links always are",
    ).toBe(path.join(root, "docs", "guide", "intro.md"));

    expect(
      resolveDocLink(intro, "notes.md?raw=1"),
      "a query string is not part of the filename either",
    ).toBe(path.join(root, "docs", "guide", "notes.md"));

    expect(
      resolveDocLink(intro, "assets/my%20diagram.png"),
      "links are percent-encoded and filenames are not: %20 is a space by the " +
        "time it reaches the filesystem",
    ).toBe(path.join(root, "docs", "guide", "assets", "my diagram.png"));

    expect(
      resolveDocLink(intro, "https://nodejs.org/api/path.html"),
      "an external link is not a file. Resolving it produces a path made of " +
        "the URL, and then a link checker reports that https: does not exist",
    ).toBeNull();

    expect(
      resolveDocLink(intro, "mailto:someone@example.com"),
      "any scheme at all, not just http",
    ).toBeNull();

    expect(
      resolveDocLink(intro, "//cdn.example.com/logo.png"),
      "a protocol-relative link is still somebody else server",
    ).toBeNull();

    expect(
      resolveDocLink(intro, "/downloads/report.pdf"),
      "a site-absolute link is relative to a web root this function knows " +
        "nothing about",
    ).toBeNull();

    expect(
      resolveDocLink(intro, "#installation"),
      "and a bare fragment points back into the same document",
    ).toBeNull();
  });

  test("ex6 - outputPathFor() moves a file between two trees", () => {
    const src = path.join(root, "site");
    const out = path.join(root, "dist");

    expect(
      outputPathFor(path.join(src, "pages", "index.md"), {
        srcRoot: src,
        outRoot: out,
        ext: ".html",
      }),
      "the structure below the source root is preserved under the output " +
        "root, and only the extension changes. Joining the whole input path " +
        "onto outRoot gives you dist/tmp/dojo-d13/site/pages/index.html, which " +
        "is the bug every build script writes once",
    ).toBe(path.join(out, "pages", "index.html"));

    expect(
      outputPathFor(path.join(src, "about.md"), { srcRoot: src, outRoot: out }),
      "with no ext the extension is kept as it was",
    ).toBe(path.join(out, "about.md"));

    expect(
      outputPathFor(path.join(src, "deep", "nested", "post.md"), {
        srcRoot: src,
        outRoot: out,
        ext: "json",
      }),
      "any depth, and the dot on ext is still optional",
    ).toBe(path.join(out, "deep", "nested", "post.json"));

    expect(
      outputPathFor(path.join(root, "elsewhere", "stray.md"), {
        srcRoot: src,
        outRoot: out,
      }),
      "a file outside the source tree has no place in the output tree",
    ).toBeNull();

    expect(
      outputPathFor(src, { srcRoot: src, outRoot: out }),
      "and the source root is not a file inside itself",
    ).toBeNull();
  });

  test("ex7 - matchesGlob() knows the difference between one star and two", () => {
    expect(matchesGlob("*.md", "readme.md"), "a star matches inside a segment").toBe(true);
    expect(
      matchesGlob("*.md", "docs/readme.md"),
      "...and never across a separator. A single star that crosses / is why " +
        "an ignore rule quietly matches your whole tree",
    ).toBe(false);

    expect(matchesGlob("docs/*.md", "docs/readme.md"), "literal segments match literally").toBe(
      true,
    );
    expect(matchesGlob("docs/*.md", "docs/api/readme.md"), "one star, one segment").toBe(false);
    expect(matchesGlob("docs/*.md", "notes/readme.md"), "the literal has to match too").toBe(
      false,
    );

    expect(
      matchesGlob("**/*.test.ts", "src/deep/a.test.ts"),
      "two stars stand in for any number of segments",
    ).toBe(true);
    expect(
      matchesGlob("**/*.test.ts", "a.test.ts"),
      "including NONE of them. If this one is false you have written ** as " +
        "one-or-more, and half your test files stop being collected",
    ).toBe(true);
    expect(matchesGlob("**/*.test.ts", "src/a.ts"), "the tail still has to match").toBe(false);

    expect(matchesGlob("src/**/*.ts", "src/a.ts"), "zero segments in the middle").toBe(true);
    expect(matchesGlob("src/**/*.ts", "src/x/y/z/a.ts"), "or four of them").toBe(true);
    expect(matchesGlob("src/**", "src/anything/at/all.txt"), "a trailing ** takes the rest").toBe(
      true,
    );
    expect(matchesGlob("src/**", "lib/thing.txt"), "but only under src").toBe(false);

    expect(matchesGlob("a/b/c.ts", "a/b/c.ts"), "no wildcards at all is an equality test").toBe(
      true,
    );
    expect(matchesGlob("a/b", "a/b/c.ts"), "a pattern that runs out does not match").toBe(false);
  });

  test("ex8 - shortestUniqueLabels() names a file by as little as it can", () => {
    expect(
      shortestUniqueLabels(["src/api/index.ts", "src/web/index.ts", "README.md"]),
      "index.ts alone would be ambiguous, so each one takes the segment above " +
        "it - and only as many as it needs. This is what your editor does to " +
        "the tab titles when you open two files with the same name",
    ).toEqual({
      "src/api/index.ts": "api/index.ts",
      "src/web/index.ts": "web/index.ts",
      "README.md": "README.md",
    });

    expect(
      shortestUniqueLabels(["a/shared/deep/file.ts", "b/shared/deep/file.ts"]),
      "when the paths differ only at the very top, the labels have to go all " +
        "the way up",
    ).toEqual({
      "a/shared/deep/file.ts": "a/shared/deep/file.ts",
      "b/shared/deep/file.ts": "b/shared/deep/file.ts",
    });

    expect(
      shortestUniqueLabels(["one/two/three/leaf.ts", "other/three/leaf.ts"]),
      "each path is measured against every other one independently: two " +
        "segments settle the second, three are needed for the first",
    ).toEqual({
      "one/two/three/leaf.ts": "two/three/leaf.ts",
      "other/three/leaf.ts": "other/three/leaf.ts",
    });

    expect(
      shortestUniqueLabels(["only/one/file.ts"]),
      "with nothing to be confused with, the basename is enough",
    ).toEqual({ "only/one/file.ts": "file.ts" });

    expect(shortestUniqueLabels([]), "no paths, no labels").toEqual({});
  });
});
