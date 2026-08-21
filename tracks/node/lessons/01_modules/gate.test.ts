// Gate for node/01_modules. Quoted verbatim in README.md.
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

import { moduleDirname } from "./ex1/solution";
import { checkout, regions } from "./ex2/solution";
import * as first from "./ex3/solution";
import * as second from "./ex3/solution";
import { loadFormatter } from "./ex4/solution";
import { loadedFormatters } from "./ex4/formatters/registry";
import { createModuleCache } from "./challenge/solution";
import { firstTimeSeeing, seenCount } from "./review1/solution";

describe("01_modules", () => {
  test("ex1 - moduleDirname() turns a module URL into a real directory path", () => {
    const here = moduleDirname(import.meta.url);
    expect(
      path.isAbsolute(here),
      "the result must be an absolute filesystem path, not a file:// URL - " +
        "node:url has a function for exactly this conversion",
    ).toBe(true);
    expect(
      path.basename(here),
      "the gate module lives in lessons/01_modules, so the directory name is " +
        "01_modules - you returned the wrong level of the path",
    ).toBe("01_modules");
    expect(
      existsSync(here),
      "the path you returned does not exist on disk, so it is not the real " +
        "directory - a hand-rolled string edit of the URL is the usual cause",
    ).toBe(true);

    const spaced = pathToFileURL(path.join(tmpdir(), "my dojo", "app.js")).href;
    expect(
      moduleDirname(spaced),
      "a URL percent-encodes spaces (%20) and prefixes Windows drive letters " +
        "with a slash; only fileURLToPath undoes both - reread README ex1",
    ).toBe(path.join(tmpdir(), "my dojo"));
  });

  test("ex2 - checkout() reaches into a CommonJS module from ESM", () => {
    expect(
      checkout(1000, "us"),
      "1000 cents at the us rate of 0.07 is 1070 - call priceWithTax from " +
        "legacy-pricing.cjs rather than reimplementing it here",
    ).toBe(1070);
    expect(
      checkout(2500, "de"),
      "the German rate is 0.19, so 2500 becomes 2975 - if you got 2500 you " +
        "never reached the CommonJS module",
    ).toBe(2975);
    expect(
      regions(),
      "regions() must read the keys of the RATES object the CommonJS module " +
        "exports, sorted - not a list you typed out yourself",
    ).toEqual(["de", "jp", "us"]);
  });

  test("ex3 - a module is evaluated once and shared by every importer", () => {
    expect(
      first.nextId(),
      "the first id issued in this process must be job-1 - the counter starts " +
        "at 0 when the module body runs",
    ).toBe("job-1");
    expect(
      second.nextId(),
      "`first` and `second` are two imports of the same module, so they share " +
        "one counter: the second call must be job-2, not job-1 again",
    ).toBe("job-2");
    expect(
      first.idsIssued(),
      "idsIssued() reports module-level state, so after two calls it is 2",
    ).toBe(2);
  });

  test("ex4 - loadFormatter() imports the formatter only when it is asked for", async () => {
    expect(
      [...loadedFormatters()],
      "no formatter module may be evaluated before loadFormatter() is called - " +
        "a static import at the top of your file breaks this",
    ).toEqual([]);

    const csv = await loadFormatter("csv");
    expect(
      csv([{ id: 1, name: "widget" }]),
      "loadFormatter() must resolve to the module's *default* export - a " +
        "dynamic import gives you the namespace object, not the function",
    ).toBe("id,name\n1,widget");
    expect(
      [...loadedFormatters()],
      "only the csv module should have been evaluated so far",
    ).toEqual(["csv"]);

    const json = await loadFormatter("json");
    expect(
      json([{ id: 2 }]),
      "the json formatter stringifies the rows it is given",
    ).toBe('[{"id":2}]');
    expect(
      [...loadedFormatters()],
      "now both modules are loaded, in the order they were first requested",
    ).toEqual(["csv", "json"]);

    await expect(
      // @ts-expect-error - deliberately out of range, the way real input is
      loadFormatter("xml"),
      "an unknown kind must reject with an error naming the kind, e.g. " +
        '"unknown formatter: xml" - a silent undefined is worse than a throw',
    ).rejects.toThrow(/unknown formatter: xml/);
  });

  test("challenge - createModuleCache() loads once per key and forgets failures", async () => {
    const calls: string[] = [];
    let settle: (() => void) | undefined;
    const cache = createModuleCache((key: string) => {
      calls.push(key);
      if (key === "broken") return Promise.reject(new Error("load failed"));
      return new Promise<string>((resolve) => {
        settle = () => resolve(`module:${key}`);
      });
    });

    const a = cache.get("alpha");
    const b = cache.get("alpha");
    expect(
      calls,
      "two overlapping gets for the same key must share one in-flight load - " +
        "cache the promise, not just the finished value",
    ).toEqual(["alpha"]);
    settle?.();
    expect(
      [await a, await b],
      "both callers get the same resolved value",
    ).toEqual(["module:alpha", "module:alpha"]);

    await cache.get("alpha");
    expect(
      calls,
      "a resolved key is cached: the third get must not call the loader again",
    ).toEqual(["alpha"]);

    await expect(
      cache.get("broken"),
      "a failing load must reject rather than resolve to undefined",
    ).rejects.toThrow("load failed");
    await expect(
      cache.get("broken"),
      "a failure must NOT be cached - like require(), the entry is dropped so " +
        "the next call retries (README challenge)",
    ).rejects.toThrow("load failed");
    expect(
      calls.filter((key) => key === "broken").length,
      "the broken key should have been attempted twice, once per get",
    ).toBe(2);
    expect(
      cache.size(),
      "only successfully loaded keys stay in the cache, so size() is 1",
    ).toBe(1);
  });

  test("review1 - module state remembers what the process has already seen", () => {
    expect(
      firstTimeSeeing("order-1"),
      "the first sighting of a token is new, so the answer is true",
    ).toBe(true);
    expect(
      firstTimeSeeing("order-1"),
      "the module kept the token in its own state, so the second sighting is " +
        "false - this is the same singleton rule as ex3",
    ).toBe(false);
    expect(
      firstTimeSeeing("order-2"),
      "a different token is new again",
    ).toBe(true);
    expect(
      seenCount(),
      "two distinct tokens have been seen, so seenCount() is 2 - a duplicate " +
        "must not be counted twice",
    ).toBe(2);
  });
});
