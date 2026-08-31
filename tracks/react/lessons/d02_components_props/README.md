# d02 — Components and props (drill set)

Eight problems on the interface between a component and its caller: defaults,
optional props, props that become attributes, props that are callbacks, and the
difference between a prop that was not passed and one that was passed as
nothing. It drills `01_components_jsx` and `02_props_composition` — redo those
if the phrase "controlled component" does not yet mean something specific to
you.

Still no effects and no data fetching. Two of these components hold no state at
all on purpose, which is the point of ex4.

## Exercise 1 — a default that fires at the right time

Edit `ex1/solution.tsx`. `WelcomeLine({ name, salutation })` renders one paragraph
reading `<salutation>, <name>!`. When `salutation` is not passed it is `Hello`.

```
uv run dojo test react d02_components_props ex1
```

## Exercise 2 — one prop, two attributes

Edit `ex2/solution.tsx`. `Avatar({ src, name, size })` renders an `<img>` whose
`src` is `src`, whose accessible name is `name`, and whose `width` and `height`
are both `size` — defaulting to `40` when no size is passed.

```
uv run dojo test react d02_components_props ex2
```

## Exercise 3 — the external link

Edit `ex3/solution.tsx`. `LinkButton({ href, label, external })` renders an
anchor with that `href`.

- Internal (the default): accessible name exactly `label`, and **no** `target`
  and **no** `rel` attribute.
- External: `target="_blank"`, `rel="noreferrer"`, and the text ` (opens in a
  new tab)` added inside the link so the accessible name becomes
  `<label> (opens in a new tab)`.

```
uv run dojo test react d02_components_props ex3
```

## Exercise 4 — controlled, and nothing but

Edit `ex4/solution.tsx`. `Stepper({ value, step, min, max, onChange })` renders
`Decrease` and `Increase` buttons around a live region showing `value`. The
component holds **no state**: the buttons call `onChange(value - step)` and
`onChange(value + step)`, `step` defaults to `1`, `Decrease` is disabled at
`min` and `Increase` at `max`.

The gate clicks `Increase` twice without changing the `value` prop and requires
that both clicks ask for the same number. The stub keeps its own copy and fails
there.

```
uv run dojo test react d02_components_props ex4
```

## Exercise 5 — a status, a role and a word

Edit `ex5/solution.tsx`. `StatusPill({ status })` renders one element:

| status | role | text |
| --- | --- | --- |
| `queued` | `status` | `Queued` |
| `running` | `status` | `Running` |
| `done` | `status` | `Done` |
| `failed` | `alert` | `Failed` |
| anything else | — | renders nothing at all |

```
uv run dojo test react d02_components_props ex5
```

## Exercise 6 — the pagination summary

Edit `ex6/solution.tsx`. `PageInfo({ page, pageSize, total })` renders a
paragraph reading `Showing <first>-<last> of <total>`, one-based: page 2 of a
10-per-page list of 57 reads `Showing 11-20 of 57`, and page 6 reads
`Showing 51-57 of 57` — the last page stops at the total. A `total` of `0`
renders `No results` instead.

```
uv run dojo test react d02_components_props ex6
```

## Exercise 7 — the switch and its description

Edit `ex7/solution.tsx`. `ToggleRow({ label, checked, onChange, description,
disabled })` renders a control with `role="switch"`:

- its accessible name is exactly `label`, and `aria-checked` follows `checked`;
- clicking it calls `onChange(!checked)` once — it stores nothing itself;
- when `description` is passed, it becomes the switch's **accessible
  description** (`aria-describedby` pointing at another element, not text inside
  the button);
- when `description` is not passed there is no description and no
  `aria-describedby` attribute at all;
- `disabled` disables the control, and a click on it calls nothing.

```
uv run dojo test react d02_components_props ex7
```

## Exercise 8 — undefined is not null

Edit `ex8/solution.tsx`. `NoticeBar({ message, footer, onDismiss })` shows
`message`, plus:

- no `footer` prop → the default text `Nothing to do`;
- `footer={null}` → **no footer text at all** (the caller said there is none);
- `footer="…"` → that text;
- `onDismiss` passed → a `type="button"` button named `Dismiss` that calls it
  once; not passed → no button at all.

```
uv run dojo test react d02_components_props ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d02_components_props. Quoted verbatim in README.md.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { WelcomeLine } from "./ex1/solution";
import { Avatar } from "./ex2/solution";
import { LinkButton } from "./ex3/solution";
import { Stepper } from "./ex4/solution";
import { StatusPill } from "./ex5/solution";
import { PageInfo } from "./ex6/solution";
import { ToggleRow } from "./ex7/solution";
import { NoticeBar } from "./ex8/solution";

describe("d02_components_props", () => {
  test("ex1 - WelcomeLine falls back to a default salutation", () => {
    const { rerender } = render(<WelcomeLine name="Ada" />);

    expect(
      screen.queryByText("Hello, Ada!"),
      "with no salutation prop the default has to fill the gap. A line reading " +
        ", Ada! means the parameter arrived as undefined and nothing caught it " +
        "(README ex1)",
    ).not.toBeNull();

    rerender(<WelcomeLine name="Ada" salutation="Welcome back" />);
    expect(
      screen.queryByText("Welcome back, Ada!"),
      "and a salutation that was passed must win over the default",
    ).not.toBeNull();
  });

  test("ex2 - Avatar names the image and sizes it from a prop", () => {
    const { rerender } = render(<Avatar src="/img/ada.png" name="Ada Lovelace" />);

    const image = screen.queryByRole("img", { name: "Ada Lovelace" });
    expect(
      image,
      "the name prop is the image alt text, which is what gives the img its " +
        "accessible name - without it there is no img role to find (README ex2)",
    ).not.toBeNull();
    expect(
      image,
      "no size was passed, so the default of 40 goes on both dimensions",
    ).toHaveAttribute("width", "40");
    expect(image).toHaveAttribute("height", "40");
    expect(image).toHaveAttribute("src", "/img/ada.png");

    rerender(<Avatar src="/img/ada.png" name="Ada Lovelace" size={96} />);
    expect(
      screen.getByRole("img", { name: "Ada Lovelace" }),
      "a passed size replaces the default on both dimensions - one number, two " +
        "attributes",
    ).toHaveAttribute("width", "96");
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute("height", "96");
  });

  test("ex3 - LinkButton says out loud when a link leaves the page", () => {
    const { rerender } = render(<LinkButton href="/pricing" label="Pricing" />);

    const internal = screen.queryByRole("link", { name: "Pricing" });
    expect(
      internal,
      "an ordinary link is named by its label and nothing else - no warning " +
        "text is added when the link stays in the app (README ex3)",
    ).not.toBeNull();
    expect(internal).toHaveAttribute("href", "/pricing");
    expect(
      internal,
      "target and rel belong to the external case only. Adding them to every " +
        "link opens internal navigation in new tabs, which users hate",
    ).not.toHaveAttribute("target");
    expect(internal).not.toHaveAttribute("rel");

    rerender(<LinkButton href="https://react.dev" label="Docs" external />);
    const external = screen.queryByRole("link", { name: "Docs (opens in a new tab)" });
    expect(
      external,
      "an external link warns the reader in its own text, so the warning is " +
        "part of the accessible name: Docs (opens in a new tab)",
    ).not.toBeNull();
    expect(external, "and it opens in a new tab").toHaveAttribute("target", "_blank");
    expect(
      external,
      "rel=noreferrer is what stops the new tab from being handed a reference " +
        "back to this page",
    ).toHaveAttribute("rel", "noreferrer");
  });

  test("ex4 - Stepper is controlled by its value prop and nothing else", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Stepper value={5} min={0} max={10} onChange={onChange} />);

    expect(
      screen.getByRole("status").textContent,
      "the live region shows the value prop, on its own - see README ex4",
    ).toBe("5");

    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(
      onChange,
      "Increase does not change anything itself: it asks the parent for the " +
        "next value, which with the default step is 6",
    ).toHaveBeenCalledWith(6);

    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(
      onChange,
      "the value prop is still 5, so the second click must ask for 6 again. " +
        "Asking for 7 means this component kept its own copy of the value and " +
        "has already drifted away from the parent (README ex4)",
    ).toHaveBeenNthCalledWith(2, 6);
    expect(
      screen.getByRole("status").textContent,
      "and the display still reads 5, because no new value prop arrived",
    ).toBe("5");

    rerender(<Stepper value={6} step={2} min={0} max={10} onChange={onChange} />);
    expect(screen.getByRole("status").textContent, "a new value prop is obeyed").toBe("6");
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(onChange, "and the step prop is respected in both directions").toHaveBeenNthCalledWith(
      3,
      4,
    );

    rerender(<Stepper value={10} step={1} min={0} max={10} onChange={onChange} />);
    expect(
      screen.getByRole("button", { name: "Increase" }),
      "at max there is nowhere up to go, so Increase is disabled",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease" })).toBeEnabled();

    rerender(<Stepper value={0} step={1} min={0} max={10} onChange={onChange} />);
    expect(
      screen.getByRole("button", { name: "Decrease" }),
      "and at min it is Decrease that is disabled",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeEnabled();
  }, 30000);

  test("ex5 - StatusPill maps a status onto a role and a word", () => {
    const { container, rerender } = render(<StatusPill status="queued" />);

    expect(
      screen.queryByRole("status"),
      "a quiet status is a polite live region, role=status, and the word shown " +
        "is capitalised for the reader rather than echoed raw (README ex5)",
    ).toHaveTextContent("Queued");

    rerender(<StatusPill status="running" />);
    expect(screen.queryByRole("status")).toHaveTextContent("Running");

    rerender(<StatusPill status="done" />);
    expect(screen.queryByRole("status")).toHaveTextContent("Done");

    rerender(<StatusPill status="failed" />);
    expect(
      screen.queryByRole("alert"),
      "failure is the one status worth interrupting for, so it is role=alert",
    ).toHaveTextContent("Failed");
    expect(
      screen.queryByRole("status"),
      "and a failure must not also be a polite status - one status, one role",
    ).toBeNull();

    rerender(<StatusPill status="hibernating" />);
    expect(
      container.textContent,
      "a status the component does not know about renders nothing at all: " +
        "return null rather than inventing a pill for it",
    ).toBe("");
  });

  test("ex6 - PageInfo counts the window it is showing", () => {
    const { rerender } = render(<PageInfo page={2} pageSize={10} total={57} />);

    expect(
      screen.queryByText("Showing 11-20 of 57"),
      "page 2 of a 10-per-page list starts at 11 and ends at 20 - both ends " +
        "are computed from the three props (README ex6)",
    ).not.toBeNull();

    rerender(<PageInfo page={6} pageSize={10} total={57} />);
    expect(
      screen.queryByText("Showing 51-57 of 57"),
      "the last page is short, so the upper end is the total, not page times " +
        "pageSize. Showing 51-60 of 57 is the bug this check exists for",
    ).not.toBeNull();

    rerender(<PageInfo page={1} pageSize={10} total={3} />);
    expect(
      screen.queryByText("Showing 1-3 of 3"),
      "one short page is both the first and the last page",
    ).not.toBeNull();

    rerender(<PageInfo page={1} pageSize={10} total={0} />);
    expect(
      screen.queryByText("No results"),
      "and an empty result set says so in words rather than reading " +
        "Showing 1-0 of 0",
    ).not.toBeNull();
  });

  test("ex7 - ToggleRow is a switch that describes itself", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <ToggleRow label="Email alerts" checked={false} onChange={onChange} />,
    );

    const off = screen.queryByRole("switch", { name: "Email alerts" });
    expect(
      off,
      "role=switch plus aria-checked is the pattern for an on/off control, and " +
        "its accessible name is the label prop alone (README ex7)",
    ).not.toBeNull();
    expect(off, "an off switch reports aria-checked=false").toHaveAttribute("aria-checked", "false");
    expect(
      off,
      "no description prop means no description at all - and no aria-describedby " +
        "attribute pointing at an element that does not exist",
    ).not.toHaveAttribute("aria-describedby");

    await user.click(off!);
    expect(
      onChange,
      "a click asks the parent to flip it: onChange gets the opposite of the " +
        "checked prop, once",
    ).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <ToggleRow
        label="Email alerts"
        checked
        onChange={onChange}
        description="We send at most one message a day"
      />,
    );
    const on = screen.getByRole("switch", { name: "Email alerts" });
    expect(on, "a checked prop of true reports aria-checked=true").toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      on,
      "the description is wired up with aria-describedby, which keeps it out of " +
        "the name. A description rendered inside the button becomes part of the " +
        "name instead, and the query above stops finding it",
    ).toHaveAccessibleDescription("We send at most one message a day");

    await user.click(on);
    expect(onChange, "and an on switch asks to be turned off").toHaveBeenNthCalledWith(2, false);

    rerender(<ToggleRow label="Email alerts" checked onChange={onChange} disabled />);
    const locked = screen.getByRole("switch", { name: "Email alerts" });
    expect(locked, "a disabled switch says so in the DOM").toBeDisabled();
    fireEvent.click(locked);
    expect(
      onChange,
      "and a disabled control changes nothing - the call count has not moved",
    ).toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex8 - NoticeBar tells a missing prop apart from an empty one", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(<NoticeBar message="Deploy finished" />);

    expect(screen.queryByText("Deploy finished"), "the message is always shown").not.toBeNull();
    expect(
      screen.queryByText("Nothing to do"),
      "no footer prop means undefined, and a default parameter is exactly what " +
        "undefined is for (README ex8)",
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Dismiss" }),
      "no onDismiss prop means no Dismiss button - a button that calls " +
        "undefined is worse than no button",
    ).toBeNull();

    rerender(<NoticeBar message="Deploy finished" footer={null} />);
    expect(
      screen.queryByText("Nothing to do"),
      "footer={null} is the caller saying there is no footer. A default " +
        "parameter does not fire for null, and neither does || - which is how " +
        "the default sneaks back in and overrides a deliberate choice",
    ).toBeNull();

    rerender(<NoticeBar message="Deploy finished" footer="Retry in 5 minutes" />);
    expect(
      screen.queryByText("Retry in 5 minutes"),
      "a footer that was passed is shown as given",
    ).not.toBeNull();

    rerender(<NoticeBar message="Deploy finished" onDismiss={onDismiss} />);
    const dismiss = screen.queryByRole("button", { name: "Dismiss" });
    expect(dismiss, "passing onDismiss is what brings the button into existence").not.toBeNull();
    expect(
      dismiss,
      "and it is type=button, because nobody here knows whose form it landed in",
    ).toHaveAttribute("type", "button");

    await user.click(dismiss!);
    expect(onDismiss, "clicking it calls the prop once").toHaveBeenCalledTimes(1);
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d03_children_composition**, where the prop is the markup itself.
