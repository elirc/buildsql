// Gate for node/d02_module_patterns. Quoted verbatim in README.md.
//
// Eight patterns you build *out of* modules. Nothing here touches the clock or
// the disk: every problem is graded by counting calls and comparing shapes, so
// the answers are the same on every machine.
import { describe, expect, test, vi } from "vitest";

import { once } from "./ex1/solution";
import { createRegistry } from "./ex2/solution";
import { defineConfig } from "./ex3/solution";
import { createNamespace } from "./ex4/solution";
import { createService } from "./ex5/solution";
import { createPluginHost, type Plugin } from "./ex6/solution";
import { createContainer } from "./ex7/solution";
import { orderPlugins } from "./ex8/solution";

describe("d02_module_patterns", () => {
  test("ex1 - once() runs the factory at most once, and not at all until asked", () => {
    let builds = 0;
    const build = once(() => {
      builds += 1;
      return { id: builds };
    });
    expect(
      builds,
      "once() only wraps the factory - nothing may run until the wrapper is " +
        "called. A lazy singleton that builds eagerly is just a singleton",
    ).toBe(0);

    const first = build();
    expect(builds, "the first call runs it").toBe(1);
    expect(
      build(),
      "and every later call hands back the same value, without running the " +
        "factory again - identity, not just equality",
    ).toBe(first);
    expect(builds, "still one run").toBe(1);

    let voids = 0;
    const nothing = once((): undefined => {
      voids += 1;
      return undefined;
    });
    nothing();
    nothing();
    expect(
      voids,
      "a factory that returns undefined has still RUN. Using the cached value " +
        "itself as the have-we-run flag is the bug this checks for",
    ).toBe(1);

    let attempts = 0;
    const flaky = once(() => {
      attempts += 1;
      if (attempts === 1) throw new Error("config file not ready");
      return "loaded";
    });
    expect(() => flaky(), "the first attempt throws").toThrow("config file not ready");
    expect(
      flaky(),
      "a throw must NOT be cached: the next caller gets a real second attempt, " +
        "the same way require() drops a module whose body threw",
    ).toBe("loaded");
    expect(attempts, "exactly two attempts happened").toBe(2);
  });

  test("ex2 - createRegistry() refuses to be ambiguous", () => {
    const registry = createRegistry<string>();
    expect(registry.names(), "a new registry is empty").toEqual([]);
    expect(registry.has("csv"), "and knows nothing").toBe(false);

    registry.register("csv", "comma separated");
    registry.register("avro", "row oriented");
    expect(
      registry.names(),
      "names() is sorted, so the answer does not depend on the order the " +
        "modules happened to be imported in",
    ).toEqual(["avro", "csv"]);
    expect(registry.get("csv"), "get() returns what was registered").toBe(
      "comma separated",
    );
    expect(registry.has("csv"), "has() answers without throwing").toBe(true);

    expect(
      () => registry.register("csv", "something else"),
      "a second registration under a live name is a bug in the caller, not a " +
        "silent overwrite - two plugins fighting over one name must be loud",
    ).toThrow("duplicate registration: csv");
    expect(
      registry.get("csv"),
      "and the original registration survives the rejected one",
    ).toBe("comma separated");

    expect(
      () => registry.get("xml"),
      "an unknown name throws rather than returning undefined, so the failure " +
        "lands at the lookup instead of three frames later",
    ).toThrow("nothing registered under: xml");
  });

  test("ex3 - defineConfig() merges onto defaults and then freezes", () => {
    const config = defineConfig({ port: 8080, limits: { timeoutMs: 250 } });
    expect(
      config,
      "top-level keys override, the nested limits object merges key by key, " +
        "and anything unmentioned keeps its default",
    ).toEqual({
      port: 8080,
      host: "0.0.0.0",
      limits: { maxBodyBytes: 1_000_000, timeoutMs: 250 },
      tags: [],
    });

    expect(Object.isFrozen(config), "the result is frozen").toBe(true);
    expect(
      Object.isFrozen(config.limits),
      "and so is the nested object - a shallow freeze leaves the interesting " +
        "half of the config writable",
    ).toBe(true);
    expect(Object.isFrozen(config.tags), "arrays count too").toBe(true);
    expect(
      () => {
        (config as { port: number }).port = 1;
      },
      "module code is strict mode, so writing to a frozen object throws " +
        "instead of failing quietly",
    ).toThrow();

    const second = defineConfig({ tags: ["eu"] });
    expect(
      second.limits.timeoutMs,
      "the defaults must not have been mutated by the first call - a shared " +
        "mutable default object is the classic module-scope leak",
    ).toBe(5_000);
    expect(second.port, "and the first call has not leaked its port either").toBe(3_000);
    expect(
      second.limits,
      "each call gets its own nested objects, or freezing one would freeze " +
        "everybody",
    ).not.toBe(config.limits);
    expect(second.tags, "an array override replaces wholesale").toEqual(["eu"]);
  });

  test("ex4 - createNamespace() evaluates a member the first time it is read", () => {
    const built: string[] = [];
    const namespace = createNamespace({
      parser: () => {
        built.push("parser");
        return { kind: "parser" };
      },
      renderer: () => {
        built.push("renderer");
        return { kind: "renderer" };
      },
    });

    expect(
      built,
      "building the namespace must build nothing: that is the whole point of " +
        "the pattern",
    ).toEqual([]);
    expect(
      Object.keys(namespace).sort(),
      "the members are enumerable even though none has been evaluated - the " +
        "shape of the namespace is known before its contents are",
    ).toEqual(["parser", "renderer"]);
    expect(built, "and listing the keys did not evaluate anything either").toEqual([]);

    const parser = namespace.parser;
    expect(
      built,
      "reading one member evaluates that member and no other. A namespace " +
        "that builds everything on first touch is an eager namespace with " +
        "extra steps",
    ).toEqual(["parser"]);
    expect(
      namespace.parser,
      "reading it again returns the same instance without re-running",
    ).toBe(parser);
    expect(built, "still one build").toEqual(["parser"]);

    const renderer = namespace.renderer;
    expect(renderer, "the second member is built on demand too").toEqual({
      kind: "renderer",
    });
    expect(built, "the second member builds when it is first read").toEqual([
      "parser",
      "renderer",
    ]);
    expect(
      namespace.missing,
      "an unknown member is undefined, exactly like any other object",
    ).toBeUndefined();
  });

  test("ex5 - createService() takes its dependencies rather than importing them", () => {
    const clock = vi.fn(() => 1_700_000_000_000);
    const service = createService({ now: clock, ids: () => "evt-1" });

    expect(
      service.record("signup"),
      "the injected clock and id generator are used, and the record carries " +
        "both plus the event name",
    ).toEqual({ id: "evt-1", event: "signup", at: 1_700_000_000_000 });
    expect(clock, "the clock was actually called").toHaveBeenCalled();
    expect(
      service.history(),
      "the default store is still in play: overriding two dependencies must " +
        "not throw the third away",
    ).toEqual([{ id: "evt-1", event: "signup", at: 1_700_000_000_000 }]);

    const plain = createService();
    expect(
      plain.history(),
      "a service built with no overrides starts empty - if it sees the other " +
        "service history, your default dependencies are one shared object at " +
        "module scope instead of a fresh set per service",
    ).toEqual([]);

    const first = plain.record("ping");
    const second = plain.record("pong");
    expect(first.id, "the default id generator counts from one").toBe("e-1");
    expect(second.id, "and keeps counting").toBe("e-2");
    expect(
      typeof second.at === "number" && second.at > 1_600_000_000_000,
      "the default clock is the real one, so the timestamp is a plausible " +
        "epoch millisecond value",
    ).toBe(true);
  });

  test("ex6 - createPluginHost() runs a lifecycle, in order and once", () => {
    const events: string[] = [];
    const plugin = (name: string, command?: string): Plugin => ({
      name,
      setup(api) {
        events.push(`setup:${name}`);
        if (command) api.addCommand(command, () => `${name} ran ${command}`);
        return () => events.push(`teardown:${name}`);
      },
    });

    const host = createPluginHost();
    expect(
      host.use(plugin("logger")),
      "use() is chainable, because registration reads better as one expression",
    ).toBe(host);
    host.use(plugin("router", "route")).use({
      name: "quiet",
      setup() {
        events.push("setup:quiet");
      },
    });

    expect(
      events,
      "registering a plugin must not run it - setup belongs to start()",
    ).toEqual([]);
    expect(host.started(), "nothing has started yet").toBe(false);
    expect(
      () => host.run("route"),
      "and a command cannot run before the plugin that registers it has been " +
        "set up",
    ).toThrow("not started");

    host.start();
    expect(
      events,
      "every plugin is set up exactly once, in registration order",
    ).toEqual(["setup:logger", "setup:router", "setup:quiet"]);
    expect(host.started(), "and now it is started").toBe(true);
    expect(host.run("route"), "a command registered during setup is callable").toBe(
      "router ran route",
    );
    expect(
      () => host.run("deploy"),
      "an unknown command names itself in the error",
    ).toThrow("unknown command: deploy");

    expect(
      () => host.start(),
      "starting twice would set every plugin up twice - refuse instead",
    ).toThrow("already started");
    expect(
      () => host.use(plugin("late")),
      "and a plugin added after start would never be set up at all, so that " +
        "is refused too",
    ).toThrow("cannot add plugins after start");

    events.length = 0;
    host.stop();
    expect(
      events,
      "teardowns run in REVERSE registration order, and only for the plugins " +
        "that returned one - later plugins may depend on earlier ones, so the " +
        "earlier ones must outlive them",
    ).toEqual(["teardown:router", "teardown:logger"]);
    expect(host.started(), "stopped again").toBe(false);
    expect(
      () => host.run("route"),
      "and the commands are gone with it",
    ).toThrow("not started");
  });

  test("ex7 - createContainer() builds a graph once and refuses to loop", () => {
    const container = createContainer();
    let dbBuilds = 0;

    container.register("db", () => {
      dbBuilds += 1;
      return { kind: "db" };
    });
    container.register("repo", (c) => ({ kind: "repo", db: c.resolve("db") }));
    container.register("service", (c) => ({
      kind: "service",
      repo: c.resolve("repo"),
      db: c.resolve("db"),
    }));

    const service = container.resolve<{ repo: { db: unknown }; db: unknown }>("service");
    expect(
      service.repo.db,
      "the db reached through the repo and the db reached directly are the " +
        "same instance: a container registration is a singleton, not a recipe " +
        "re-run per caller",
    ).toBe(service.db);
    expect(dbBuilds, "so the db factory ran exactly once").toBe(1);
    expect(
      container.resolve("service"),
      "and resolving the same name again is a cache hit",
    ).toBe(service);

    expect(
      () => container.resolve("cache"),
      "an unregistered name fails at the lookup, naming itself",
    ).toThrow("nothing registered under: cache");

    container.register("left", (c) => c.resolve("right"));
    container.register("right", (c) => c.resolve("left"));
    expect(
      () => container.resolve("left"),
      "a cycle must be detected and reported as a PATH - without it the " +
        "failure is a stack overflow, which tells you nothing about which two " +
        "modules are arguing",
    ).toThrow("circular dependency: left -> right -> left");

    expect(
      container.resolve("db"),
      "and after the failure the container still works: the resolution stack " +
        "has to be unwound on the error path too",
    ).toBe(service.db);
  });

  test("ex8 - orderPlugins() sorts a graph deterministically", () => {
    const plugins = [
      { name: "router", after: ["logger"] },
      { name: "logger" },
      { name: "auth", after: ["logger"] },
      { name: "metrics", after: ["router", "auth"] },
    ];
    expect(
      orderPlugins(plugins),
      "every plugin comes after everything it names, and when several are " +
        "ready at once the tie is broken by name so the answer is stable",
    ).toEqual(["logger", "auth", "router", "metrics"]);
    expect(
      orderPlugins([...plugins].reverse()),
      "which means shuffling the input changes nothing - the order is a " +
        "property of the graph, not of the array",
    ).toEqual(["logger", "auth", "router", "metrics"]);

    expect(
      orderPlugins([{ name: "c" }, { name: "a" }, { name: "b" }]),
      "with no constraints at all the tie-break is the whole answer",
    ).toEqual(["a", "b", "c"]);
    expect(orderPlugins([]), "nothing in, nothing out").toEqual([]);

    expect(
      () => orderPlugins([{ name: "metrics", after: ["logger"] }]),
      "a dependency on something that was never registered is a typo, and the " +
        "message has to say who wanted what",
    ).toThrow("unknown dependency: metrics needs logger");

    expect(
      () =>
        orderPlugins([
          { name: "b", after: ["a"] },
          { name: "a", after: ["b"] },
          { name: "z" },
        ]),
      "a cycle cannot be ordered at all. Report the members that are left " +
        "stuck, sorted, and leave the ones that did resolve out of it",
    ).toThrow("circular dependency among: a, b");
  });
});
