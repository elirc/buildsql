# d16 — Context (drill set)

Eight problems on `createContext` and `useContext` alone — no reducers here,
they are the next set. It drills the first half of `09_context_reducer`; if
"every component that reads a context re-renders when that context's value
changes" is not a sentence you could have written yourself, reread that lesson
before you start, because three of these problems are about nothing else.

Every consumer in this set is rendered by the gate several levels below its
provider and is given **no props at all**, so the context is the only route a
value can take. Where a problem is about wasted work, the gate counts renders
with an injected `onRender` spy.

## Exercise 1 — publish, then subscribe

Edit `ex1/solution.tsx`. `UnitsProvider({ units, children })` publishes `units`;
`UnitsLabel()` takes no props and renders `Units: <units>` in a `role="status"`
paragraph. The context and the consumer are written; the publisher is not.

```
uv run dojo test react d16_context ex1
```

## Exercise 2 — fail loudly instead of quietly

Edit `ex2/solution.tsx`. `WorkspaceProvider({ name, children })`,
`useWorkspace()` and `WorkspaceName()` are all written, and rendering
`WorkspaceName` with no provider above it currently shows a plausible default.
Change it so `useWorkspace()` **throws** an error whose message contains
`WorkspaceProvider`, while still working normally inside one.

```
uv run dojo test react d16_context ex2
```

## Exercise 3 — the nearest one wins

Edit `ex3/solution.tsx`. `ZoneProvider({ zone, children })` and `ZoneBadge()`,
which renders `Zone: <zone>` in a `role="status"` paragraph. A `ZoneProvider`
nested inside another one overrides the zone **for its own subtree only**: a
badge that comes after the nested section still reads the outer zone. The stub
keeps the zone in a module-level variable, which cannot express that.

```
uv run dojo test react d16_context ex3
```

## Exercise 4 — two audiences, two contexts

Edit `ex4/solution.tsx`. `VolumeProvider({ children })` holds a volume starting
at `5`. `VolumeReadout({ onRender })` renders `Volume: <n>` in a `role="status"`
paragraph; `VolumeButtons({ onRender })` renders `Louder` and `Quieter`
buttons. Changing the volume must re-render the readout and **not** the
buttons, however many times it changes. Leave the `onRender()` calls where the
stub has them.

```
uv run dojo test react d16_context ex4
```

## Exercise 5 — the same account, a new object

Edit `ex5/solution.tsx`. `AccountProvider({ name, children })` publishes
`{ name, initials }`, and also renders its own `Synced <n> time(s)`
`role="status"` paragraph and a `Refresh` button that adds one to `n`.
`AccountChip({ onRender })` renders `<initials> - <name>` in a paragraph.
Pressing `Refresh` re-renders the provider, changes nothing about the account,
and must not re-render the chip.

```
uv run dojo test react d16_context ex5
```

## Exercise 6 — a value that counts as it goes down

Edit `ex6/solution.tsx`. `SectionHeading({ children })` renders an `<h1>` when
it is outside every `SectionProvider`, an `<h2>` inside one, an `<h3>` inside
two, and so on — stopping at `<h6>`, because HTML has nothing below it.
`SectionProvider({ children })` is what makes a subtree one level deeper.

```
uv run dojo test react d16_context ex6
```

## Exercise 7 — a context factory

Edit `ex7/solution.tsx`. `createSafeContext<T>(name)` returns
`{ Provider, useValue }`, where `Provider` takes `{ value, children }` and
`useValue()` returns the published value — or throws an error containing `name`
when there is no provider above. Two calls to the factory must produce two
completely independent contexts.

```
uv run dojo test react d16_context ex7
```

## Exercise 8 — inherit, then override

Edit `ex8/solution.tsx`. `PrefsProvider({ prefs, children })` takes a
**partial** `{ locale?, density? }` and publishes the full pair;
`PrefsReadout()` renders `<locale> / <density>` in a `role="status"` paragraph.
With no provider at all the answer is `en / cosy`. A nested provider overrides
only the keys it was given and inherits the rest from the provider above it —
not from the defaults.

```
uv run dojo test react d16_context ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d16_context. Quoted verbatim in README.md.
//
// Consumers are always rendered somewhere the gate chooses, several levels
// below the provider and never with props, so the only way a value can reach
// them is the context. Render counts come from injected onRender spies.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { UnitsProvider, UnitsLabel } from "./ex1/solution";
import { WorkspaceProvider, WorkspaceName } from "./ex2/solution";
import { ZoneProvider, ZoneBadge } from "./ex3/solution";
import { VolumeProvider, VolumeReadout, VolumeButtons } from "./ex4/solution";
import { AccountProvider, AccountChip } from "./ex5/solution";
import { SectionProvider, SectionHeading } from "./ex6/solution";
import { createSafeContext } from "./ex7/solution";
import { PrefsProvider, PrefsReadout } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

/** A few levels of ordinary markup, so nothing can arrive as a prop. */
function Deep({ children }: { children: ReactNode }) {
  return (
    <div>
      <section>
        <article>{children}</article>
      </section>
    </div>
  );
}

describe("d16_context", () => {
  test("ex1 - UnitsLabel reads a value nobody handed it", () => {
    const { unmount } = render(
      <UnitsProvider units="celsius">
        <Deep>
          <UnitsLabel />
        </Deep>
      </UnitsProvider>,
    );

    expect(
      screen.queryByRole("status"),
      "the label takes no props and sits three elements below the provider, so " +
        "the only route from one to the other is the context. A provider " +
        "component that renders its children without wrapping them in the " +
        "context-s Provider publishes nothing (README ex1)",
    ).toHaveTextContent("Units: celsius");

    unmount();

    render(
      <UnitsProvider units="fahrenheit">
        <Deep>
          <UnitsLabel />
        </Deep>
      </UnitsProvider>,
    );
    expect(screen.queryByRole("status"), "and a different value arrives too").toHaveTextContent(
      "Units: fahrenheit",
    );
  }, 30000);

  test("ex2 - useWorkspace refuses to work outside its provider", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(
      () => render(<WorkspaceName />),
      "with no provider above it the hook quietly handed back the default, so " +
        "a component wired up wrongly looks like a component showing real data. " +
        "A default of null plus a hook that throws turns that into an error " +
        "message with the provider-s name in it (README ex2)",
    ).toThrow(/WorkspaceProvider/);

    errors.mockClear();
    render(
      <WorkspaceProvider name="Design system">
        <Deep>
          <WorkspaceName />
        </Deep>
      </WorkspaceProvider>,
    );
    expect(
      screen.queryByRole("status"),
      "and inside a provider it works normally: Workspace: Design system",
    ).toHaveTextContent("Workspace: Design system");

    errors.mockRestore();
  }, 30000);

  test("ex3 - ZoneBadge takes the nearest provider above it", () => {
    render(
      <ZoneProvider zone="Europe">
        <ZoneBadge />
        <Deep>
          <ZoneProvider zone="Pacific">
            <ZoneBadge />
          </ZoneProvider>
        </Deep>
        <ZoneBadge />
      </ZoneProvider>,
    );

    expect(
      texts("status"),
      "useContext walks up the tree from the component that calls it and stops " +
        "at the first matching provider, so nesting overrides a value for that " +
        "subtree and for nothing else. A module-level variable cannot do this: " +
        "it has one value at a time, and the badge after the nested section " +
        "reads whatever was assigned last (README ex3)",
    ).toEqual(["Zone: Europe", "Zone: Pacific", "Zone: Europe"]);
  }, 30000);

  test("ex4 - VolumeButtons does not re-render when the volume changes", async () => {
    const user = userEvent.setup();
    const onReadout = vi.fn();
    const onButtons = vi.fn();

    render(
      <VolumeProvider>
        <Deep>
          <VolumeReadout onRender={onReadout} />
        </Deep>
        <Deep>
          <VolumeButtons onRender={onButtons} />
        </Deep>
      </VolumeProvider>,
    );

    expect(screen.getByRole("status"), "it starts at 5").toHaveTextContent("Volume: 5");
    expect(onReadout, "one render each to begin with").toHaveBeenCalledTimes(1);
    expect(onButtons).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Louder" }));
    expect(screen.getByRole("status"), "louder is louder").toHaveTextContent("Volume: 6");
    expect(
      onReadout,
      "the component that shows the number has to render again",
    ).toHaveBeenCalledTimes(2);
    expect(
      onButtons,
      "but the buttons only ever needed the two functions, and those did not " +
        "change. Every consumer of a context re-renders when that context-s " +
        "value changes, so a value that bundles the number together with the " +
        "functions re-renders components that never read the number " +
        "(README ex4)",
    ).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Quieter" }));
    await user.click(screen.getByRole("button", { name: "Quieter" }));
    expect(screen.getByRole("status"), "and down again").toHaveTextContent("Volume: 4");
    expect(onButtons, "still once").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex5 - AccountChip does not re-render for a value that did not change", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();

    render(
      <AccountProvider name="Ada Lovelace">
        <Deep>
          <AccountChip onRender={onRender} />
        </Deep>
      </AccountProvider>,
    );

    expect(screen.queryByText("AL - Ada Lovelace"), "the chip shows the account").not.toBeNull();
    expect(onRender, "once, so far").toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(screen.getByRole("status"), "the provider-s own state moved").toHaveTextContent(
      "Synced 1 time",
    );
    expect(
      onRender,
      "the account did not change - same name, same initials - but the provider " +
        "built a brand new object to describe it, and React compares context " +
        "values with Object.is. Every consumer in the tree re-rendered for " +
        "nothing (README ex5)",
    ).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(screen.getByRole("status")).toHaveTextContent("Synced 2 times");
    expect(onRender, "and again for nothing").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex6 - SectionHeading gets its level from how deep it is", () => {
    function nest(depth: number, children: ReactNode): ReactNode {
      return depth === 0 ? children : <SectionProvider>{nest(depth - 1, children)}</SectionProvider>;
    }

    const { unmount } = render(
      <>
        <SectionHeading>Cookbook</SectionHeading>
        <SectionProvider>
          <SectionHeading>Ingredients</SectionHeading>
          <SectionProvider>
            <SectionHeading>Dry</SectionHeading>
          </SectionProvider>
          <SectionHeading>Method</SectionHeading>
        </SectionProvider>
      </>,
    );

    expect(
      screen.queryByRole("heading", { level: 1, name: "Cookbook" }),
      "outside every section, a heading is the page-s own h1",
    ).not.toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Ingredients" }),
      "one section deep is an h2. The provider has to publish one more than " +
        "the value it inherited, which means reading the context it is about " +
        "to replace (README ex6)",
    ).not.toBeNull();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Dry" }),
      "and a section inside that one is an h3",
    ).not.toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Method" }),
      "while a heading back out at the first level is an h2 again - depth is " +
        "where you are, not how many sections exist",
    ).not.toBeNull();

    unmount();

    render(nest(9, <SectionHeading>Bottom</SectionHeading>));
    expect(
      screen.queryByRole("heading", { level: 6, name: "Bottom" }),
      "HTML stops at h6, so the level has to stop there too - there is no h10 " +
        "and rendering one produces an element with no heading role at all",
    ).not.toBeNull();
  }, 30000);

  test("ex7 - createSafeContext builds a provider and a hook that belong together", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const Theme = createSafeContext<string>("ThemeProvider");
    const Locale = createSafeContext<string>("LocaleProvider");

    function ThemeText() {
      return <p role="status">Theme: {Theme.useValue()}</p>;
    }
    function LocaleText() {
      return <p role="status">Locale: {Locale.useValue()}</p>;
    }

    const { unmount } = render(
      <Theme.Provider value="dark">
        <Locale.Provider value="en-GB">
          <Deep>
            <ThemeText />
            <LocaleText />
          </Deep>
        </Locale.Provider>
      </Theme.Provider>,
    );

    expect(
      texts("status"),
      "two calls to the factory are two independent contexts that cannot see " +
        "each other (README ex7)",
    ).toEqual(["Theme: dark", "Locale: en-GB"]);

    unmount();
    errors.mockClear();

    expect(
      () => render(<ThemeText />),
      "and the hook the factory returns carries the name it was built with, so " +
        "a missing provider says which provider is missing",
    ).toThrow(/ThemeProvider/);
    expect(() => render(<LocaleText />), "each with its own name").toThrow(/LocaleProvider/);

    errors.mockRestore();
  }, 30000);

  test("ex8 - PrefsProvider inherits what it does not override", () => {
    const { unmount } = render(<PrefsReadout />);
    expect(
      screen.queryByRole("status"),
      "with no provider at all the built-in defaults apply: en / cosy",
    ).toHaveTextContent("en / cosy");
    unmount();

    render(
      <PrefsProvider prefs={{ locale: "fr" }}>
        <PrefsReadout />
        <Deep>
          <PrefsProvider prefs={{ density: "compact" }}>
            <PrefsReadout />
            <PrefsProvider prefs={{ locale: "ja" }}>
              <PrefsReadout />
            </PrefsProvider>
          </PrefsProvider>
        </Deep>
      </PrefsProvider>,
    );

    expect(
      texts("status"),
      "each provider publishes what it was given on top of what it inherited, " +
        "which it can only do by reading the context it is about to replace. A " +
        "provider that merges over the hard-coded defaults instead throws away " +
        "every decision made above it (README ex8)",
    ).toEqual(["fr / cosy", "fr / compact", "ja / compact"]);
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d17_reducers**, where the value is held by a pure function instead of a
`useState` call.
