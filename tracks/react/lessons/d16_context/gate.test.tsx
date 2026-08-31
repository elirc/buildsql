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
