# d07 — Conditional UI (drill set)

Eight problems on deciding what to render: ternaries, guard clauses, returning
`null`, conditional attributes, and the two traps that outlive every tutorial —
the falsy `0` that leaks into the page, and the state that disappears when the
branch holding it is unmounted. It drills the conditional half of
`04_lists_conditional`.

No data fetching here, and no timers. Every component is a pure function of its
props except the last one, which is where the interesting question lives.

## Exercise 1 — signed in, or not

Edit `ex1/solution.tsx`. `AuthNav({ user })` renders a `Sign in` button when
`user` is `null`, and otherwise the text `Hi, <name>` plus a `Sign out` button.
Never both.

```
uv run dojo test react d07_conditional_ui ex1
```

## Exercise 2 — the badge that leaks a zero

Edit `ex2/solution.tsx`. `CartBadge({ count })` renders
`<span role="status">{count}</span>` when the count is above zero, and
**nothing whatsoever** when it is zero. The gate reads the whole container and
fails if a `0` reached the DOM.

```
uv run dojo test react d07_conditional_ui ex2
```

## Exercise 3 — rendering nothing

Edit `ex3/solution.tsx`. `MaintenanceBanner({ notice })` renders a `role="status"`
element carrying the notice — or, when `notice` is `null`, nothing at all: the
gate asserts the container's `innerHTML` is the empty string, so an empty wrapper
counts as a failure.

```
uv run dojo test react d07_conditional_ui ex3
```

## Exercise 4 — four statuses, four shapes

Edit `ex4/solution.tsx`. `OrderStatus({ order })` takes a discriminated union and
renders:

- `pending` — the words `Placing order`;
- `shipped` — a link named `Track with <carrier>` whose `href` is `trackingUrl`;
- `delivered` — a `<time>` showing `deliveredOn` with `deliveredAt` in its
  `datetime` attribute;
- `cancelled` — a `role="alert"` containing the `reason`.

Exactly one of them at a time.

```
uv run dojo test react d07_conditional_ui ex4
```

## Exercise 5 — three answers in priority order

Edit `ex5/solution.tsx`. `AccessGate({ user, feature, children })` renders
`Sign in to continue` when `user` is `null`, `Upgrade to Pro` when the user's
`entitlements` do not include `feature`, and the `children` when they do. In the
first two cases the children must not be in the document at all.

```
uv run dojo test react d07_conditional_ui ex5
```

## Exercise 6 — conditions on attributes

Edit `ex6/solution.tsx`. `SaveButton({ dirty, saving })` renders one button
whose label is `Saving` while saving and `Save` otherwise, which is disabled
while saving **and** while nothing has changed, and which carries
`aria-busy="true"` only while saving — with no `aria-busy` attribute at all
otherwise.

```
uv run dojo test react d07_conditional_ui ex6
```

## Exercise 7 — the review queue tab

Edit `ex7/solution.tsx`. `ReviewQueueTab({ count, snoozed })` renders a button
whose accessible name is:

- `Reviews snoozed` when snoozed, whatever the count;
- `No reviews waiting` at zero;
- `1 review waiting` at one, and `<n> reviews waiting` above that.

Inside it, a badge showing the count — capped at `9+` above nine — which is
hidden from assistive technology and is not drawn at all when snoozed or at zero.
The gate checks that no digit reaches the screen in those two cases.

```
uv run dojo test react d07_conditional_ui ex7
```

## Exercise 8 — the draft that must survive

Edit `ex8/solution.tsx`. `ComposeTabs()` renders `Write` and `Preview` buttons —
the current one carrying `aria-pressed="true"`, the other `"false"` — and one
panel below them. `Write` shows a textarea labelled `Draft`; `Preview` shows a
`<section aria-label="Preview">` containing the current draft text and no
textarea. Typing, switching to Preview and switching back must not lose a
character.

```
uv run dojo test react d07_conditional_ui ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d07_conditional_ui. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { AuthNav } from "./ex1/solution";
import { CartBadge } from "./ex2/solution";
import { MaintenanceBanner } from "./ex3/solution";
import { OrderStatus } from "./ex4/solution";
import { AccessGate } from "./ex5/solution";
import { SaveButton } from "./ex6/solution";
import { ReviewQueueTab } from "./ex7/solution";
import { ComposeTabs } from "./ex8/solution";

describe("d07_conditional_ui", () => {
  test("ex1 - AuthNav shows one of its two states and never both", () => {
    const { rerender } = render(<AuthNav user={null} />);

    expect(
      screen.queryByRole("button", { name: "Sign in" }),
      "with nobody signed in the only thing on offer is Sign in (README ex1)",
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
      "and there is nothing to sign out of yet",
    ).toBeNull();

    rerender(<AuthNav user={{ name: "Ada" }} />);
    expect(screen.queryByText("Hi, Ada"), "a signed-in visitor gets a greeting").not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
      "and the way back out",
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Sign in" }),
      "both halves are on screen at once. These two states are alternatives, " +
        "so they belong in one ternary rather than two independent conditions " +
        "that can disagree",
    ).toBeNull();
  });

  test("ex2 - CartBadge stays out of the way when the cart is empty", () => {
    const empty = render(<CartBadge count={0} />);

    expect(
      empty.container.textContent,
      "a stray 0 reached the DOM. In JSX, {count && <span/>} evaluates to the " +
        "number 0 when count is 0, and React renders 0 - it skips false, null " +
        "and undefined, but a number is a thing to show (README ex2)",
    ).not.toMatch(/0/);
    expect(
      screen.queryByRole("status"),
      "an empty cart has no badge at all, not an empty one",
    ).toBeNull();
    empty.unmount();

    render(<CartBadge count={3} />);
    expect(
      screen.queryByRole("status"),
      "with something in the cart the badge appears, as a live region, showing " +
        "the count",
    ).toHaveTextContent("3");
  });

  test("ex3 - MaintenanceBanner renders nothing at all when there is nothing to say", () => {
    const quiet = render(<MaintenanceBanner notice={null} />);

    expect(
      quiet.container.innerHTML,
      "no notice means no markup: a component may return null, and React puts " +
        "nothing in the DOM for it. An empty wrapper is still an element, and " +
        "it still takes up a slot in the layout (README ex3)",
    ).toBe("");
    quiet.unmount();

    render(<MaintenanceBanner notice="Read-only until 14:00" />);
    expect(
      screen.queryByRole("status"),
      "with a notice there is a polite live region carrying it",
    ).toHaveTextContent("Read-only until 14:00");
  });

  test("ex4 - OrderStatus renders a different shape for each status", () => {
    const { rerender } = render(<OrderStatus order={{ status: "pending" }} />);

    expect(
      screen.queryByText("Placing order"),
      "a pending order says so in words (README ex4)",
    ).not.toBeNull();

    rerender(
      <OrderStatus
        order={{ status: "shipped", carrier: "DHL", trackingUrl: "https://track.example/9" }}
      />,
    );
    const link = screen.queryByRole("link", { name: "Track with DHL" });
    expect(
      link,
      "a shipped order gets a real link, named Track with DHL - the carrier is " +
        "data, so the name is built from it",
    ).not.toBeNull();
    expect(link, "pointing at the tracking url it was given").toHaveAttribute(
      "href",
      "https://track.example/9",
    );
    expect(
      screen.queryByText("Placing order"),
      "and the pending wording is gone - these are branches, not layers",
    ).toBeNull();

    rerender(
      <OrderStatus order={{ status: "delivered", deliveredAt: "2024-05-04", deliveredOn: "4 May" }} />,
    );
    const time = screen.queryByRole("time");
    expect(
      time,
      "a delivered order shows when, in a <time> element so the date is " +
        "machine-readable as well as human-readable",
    ).not.toBeNull();
    expect(time, "the ISO form goes in the datetime attribute").toHaveAttribute(
      "datetime",
      "2024-05-04",
    );
    expect(time, "and the readable form is the text").toHaveTextContent("4 May");
    expect(screen.queryByRole("link"), "there is nothing left to track").toBeNull();

    rerender(<OrderStatus order={{ status: "cancelled", reason: "Out of stock" }} />);
    const alert = screen.queryByRole("alert");
    expect(
      alert,
      "a cancellation is the one status worth interrupting for, so it is an " +
        "alert rather than a status",
    ).not.toBeNull();
    expect(alert, "and it carries the reason").toHaveTextContent("Out of stock");
  });

  test("ex5 - AccessGate lets exactly one of its three answers through", () => {
    const { rerender } = render(
      <AccessGate user={null} feature="reports">
        <p>Quarterly report</p>
      </AccessGate>,
    );

    expect(
      screen.queryByText("Sign in to continue"),
      "a signed-out visitor is asked to sign in (README ex5)",
    ).not.toBeNull();
    expect(
      screen.queryByText("Quarterly report"),
      "and must not see the children. Rendering the content behind a hidden " +
        "wrapper is not access control - the markup is right there",
    ).toBeNull();

    rerender(
      <AccessGate user={{ name: "Ada", entitlements: ["dashboards"] }} feature="reports">
        <p>Quarterly report</p>
      </AccessGate>,
    );
    expect(
      screen.queryByText("Upgrade to Pro"),
      "signed in without the entitlement is a different answer from signed out",
    ).not.toBeNull();
    expect(screen.queryByText("Sign in to continue"), "not both answers").toBeNull();
    expect(screen.queryByText("Quarterly report"), "and still no content").toBeNull();

    rerender(
      <AccessGate
        user={{ name: "Ada", entitlements: ["dashboards", "reports"] }}
        feature="reports"
      >
        <p>Quarterly report</p>
      </AccessGate>,
    );
    expect(
      screen.queryByText("Quarterly report"),
      "with the entitlement the children render, untouched",
    ).not.toBeNull();
    expect(screen.queryByText("Upgrade to Pro"), "and no upsell over the top of them").toBeNull();
  });

  test("ex6 - SaveButton changes attributes rather than swapping elements", () => {
    const { rerender } = render(<SaveButton dirty={false} saving={false} />);

    const idle = screen.getByRole("button", { name: "Save" });
    expect(
      idle,
      "nothing has changed, so there is nothing to save and the button is " +
        "disabled (README ex6)",
    ).toBeDisabled();
    expect(
      idle,
      "and it is not busy, so it must carry no aria-busy attribute at all - " +
        "aria-busy=false is a claim that something is happening and has stopped",
    ).not.toHaveAttribute("aria-busy");

    rerender(<SaveButton dirty saving={false} />);
    expect(
      screen.getByRole("button", { name: "Save" }),
      "with unsaved changes the button becomes usable, and still says Save",
    ).toBeEnabled();

    rerender(<SaveButton dirty saving />);
    const busy = screen.getByRole("button", { name: "Saving" });
    expect(busy, "while a save is in flight the label changes to Saving").toBeDisabled();
    expect(
      busy,
      "and the button announces the wait with aria-busy=true, so a screen " +
        "reader knows the silence is deliberate",
    ).toHaveAttribute("aria-busy", "true");
  });

  test("ex7 - ReviewQueueTab counts out loud and caps what it draws", () => {
    const { container, rerender } = render(<ReviewQueueTab count={0} snoozed={false} />);

    expect(
      screen.queryByRole("button", { name: "No reviews waiting" }),
      "zero gets words rather than a number - No reviews waiting " +
        "(README ex7)",
    ).not.toBeNull();
    expect(
      container.textContent,
      "and no badge is drawn for zero, so no digit reaches the screen",
    ).not.toMatch(/\d/);

    rerender(<ReviewQueueTab count={1} snoozed={false} />);
    expect(
      screen.queryByRole("button", { name: "1 review waiting" }),
      "one reviews is singular. A name reading 1 reviews waiting is " +
        "the mistake this checks for",
    ).not.toBeNull();
    expect(screen.queryByText("1"), "and the badge shows the number").not.toBeNull();

    rerender(<ReviewQueueTab count={5} snoozed={false} />);
    expect(
      screen.queryByRole("button", { name: "5 reviews waiting" }),
      "more than one is plural",
    ).not.toBeNull();

    rerender(<ReviewQueueTab count={12} snoozed={false} />);
    expect(
      screen.queryByRole("button", { name: "12 reviews waiting" }),
      "the spoken name always has the real number in it",
    ).not.toBeNull();
    expect(
      screen.queryByText("9+"),
      "but the badge is a few pixels wide, so anything past nine is drawn as 9+",
    ).not.toBeNull();

    rerender(<ReviewQueueTab count={12} snoozed />);
    expect(
      screen.queryByRole("button", { name: "Reviews snoozed" }),
      "snoozed replaces the whole message rather than decorating it",
    ).not.toBeNull();
    expect(
      container.textContent,
      "and a snoozed tab shows no count at all, so no digit reaches the screen " +
        "- the snoozed branch is checked before the counting one, not alongside it",
    ).not.toMatch(/\d/);
  });

  test("ex8 - ComposeTabs keeps the draft when the panel it lived in goes away", async () => {
    const user = userEvent.setup();
    render(<ComposeTabs />);

    expect(
      screen.getByRole("button", { name: "Write" }),
      "Write is the tab you land on (README ex8)",
    ).toHaveAttribute("aria-pressed", "true");

    await user.type(screen.getByLabelText("Draft"), "Ship it on Friday");
    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(
      screen.queryByRole("textbox"),
      "in preview there is no editor on screen - the panel really is replaced",
    ).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Preview" }),
      "the preview panel is a named region so it can be jumped to",
    ).toHaveTextContent("Ship it on Friday");
    expect(screen.getByRole("button", { name: "Preview" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Write" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Write" }));
    expect(
      screen.getByLabelText("Draft"),
      "the draft is gone. Unmounting a subtree throws away everything it was " +
        "holding, and the text of an uncontrolled textarea is held by the DOM " +
        "node that just stopped existing. State that has to outlive a branch " +
        "has to live above it",
    ).toHaveValue("Ship it on Friday");
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d08_forms_controlled**, where the value in the box becomes your problem.
