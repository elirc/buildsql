# d13 — Races and aborts (drill set)

Eight problems on one fact: a promise you no longer want will still resolve.
It drills `07_data_fetching` — if the picture of request A being started,
superseded, and then answering last is not yet in your head, reread that
lesson's "The race" section before you start, because every problem here is a
variation on it.

Every request is an injected function and the gate resolves the promises **out
of order on purpose**, so nothing depends on timing. Three of the eight cannot
be solved with the flag-in-a-cleanup pattern at all: one wants an
`AbortController`, one wants a request number, and one dissolves the race by
storing answers where they belong.

## Exercise 1 — the answer you walked away from

Edit `ex1/solution.tsx`. `StationBoard({ station, fetchDepartures })` calls
`fetchDepartures(station)`, shows `Loading departures for <station>` in a
`role="status"` paragraph while the promise is pending, and lists the resolved
strings as `<li>`s. A change of `station` starts a new request and goes back to
loading. The gate resolves the **first** station last, and the board must
ignore it.

```
uv run dojo test react d13_race_abort ex1
```

## Exercise 2 — the failure you walked away from

Edit `ex2/solution.tsx`. `ShipmentTracker({ trackingId, fetchStatus })` shows
`Checking <trackingId>` in a `role="status"` while pending, the resolved string
in a paragraph, and a rejection's message in a `role="alert"`. The gate
supersedes the first parcel and then **rejects** it: that failure must reach
nobody. A rejection of the parcel actually on screen must still be announced.

```
uv run dojo test react d13_race_abort ex2
```

## Exercise 3 — stop the work, not just the answer

Edit `ex3/solution.tsx`. `DocumentPane({ docId, fetchDoc })` calls
`fetchDoc(docId, signal)` — the second argument is an `AbortSignal`. It shows
`Loading document <docId>` in a `role="status"`, the text in a paragraph, and a
rejection's message in a `role="alert"`. When `docId` changes, the signal that
went out with the abandoned request must end up **aborted**, and the signal of
the live request must not. The rejection that aborting causes is not an error
the user should see.

```
uv run dojo test react d13_race_abort ex3
```

## Exercise 4 — the race the keyboard starts

Edit `ex4/solution.tsx`. `SymbolSearch({ lookup })` renders an input labelled
`Ticker`. While the box is empty it shows `Type a ticker` in a `role="status"`
and asks nothing. Otherwise it calls `lookup(<value>)` once per change, shows
`Searching for <value>` in a `role="status"` while pending, and shows the
resolved company name in a paragraph. The gate types `AC`, then `ACM`, then
answers `ACM` first.

```
uv run dojo test react d13_race_abort ex4
```

## Exercise 5 — two clicks, no cleanup

Edit `ex5/solution.tsx`. `AccountBalance({ accountId, fetchBalance })` shows
`Loading balance` in a `role="status"` until it has a number, then
`Balance: <n>` in a paragraph. A `Refresh` button — always enabled — asks
again. The gate clicks it twice in a row and answers the **second** click
first; the older answer must lose, and the refresh after that must still work.
No prop changes here, so no effect re-runs and no cleanup fires.

```
uv run dojo test react d13_race_abort ex5
```

## Exercise 6 — a flag per request

Edit `ex6/solution.tsx`. `PollenIndex({ city, fetchIndex })` shows
`Checking <city>` in a `role="status"` while pending and
`Pollen in <city>: <index>` in a paragraph once answered. The stub guards its
answer with a `useRef`, which works exactly once and then wedges the component
forever. The gate walks through four cities and abandons one of them mid-flight.

```
uv run dojo test react d13_race_abort ex6
```

## Exercise 7 — abandoning a chain

Edit `ex7/solution.tsx`. `ItineraryPanel({ tripId, fetchTrip, fetchLegs })`
calls `fetchTrip(tripId)`, then `fetchLegs(trip.id)` with the id the first
answer carried. Until both have arrived it shows `Loading itinerary` in a
`role="status"`; then a level-2 heading with `trip.traveller` and one `<li>`
per leg. When `tripId` changes before the first step has answered, the
abandoned chain must **not** send the second request at all.

```
uv run dojo test react d13_race_abort ex7
```

## Exercise 8 — file it under the question

Edit `ex8/solution.tsx`. `MetricTabs({ fetchMetric })` renders three buttons —
`Traffic`, `Signups`, `Revenue` — and starts with `Traffic` selected. The
selected metric's value is shown in a paragraph, or `Loading <metric>` in a
`role="status"` while it has none. `fetchMetric(metric)` is called **at most
once per metric, ever**: an answer that arrives after the user has moved on
must still be kept, so that returning to that tab shows it immediately without
a new request — but it must never appear while another tab is selected.

```
uv run dojo test react d13_race_abort ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d13_race_abort. Quoted verbatim in README.md.
//
// Every request is an injected function returning a promise this file resolves
// by hand, and it resolves them out of order on purpose. Nothing here depends
// on the network, on timing, or on how fast the machine is.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { StationBoard } from "./ex1/solution";
import { ShipmentTracker } from "./ex2/solution";
import { DocumentPane } from "./ex3/solution";
import { SymbolSearch } from "./ex4/solution";
import { AccountBalance } from "./ex5/solution";
import { PollenIndex } from "./ex6/solution";
import { ItineraryPanel } from "./ex7/solution";
import { MetricTabs } from "./ex8/solution";

type Slot<T> = { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: unknown) => void };

function deferred<T>(): Slot<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Run `action`, then let the microtask queue drain inside act(). */
async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d13_race_abort", () => {
  test("ex1 - StationBoard shows the station it is on, not the one it left", async () => {
    const kings = deferred<string[]>();
    const paddington = deferred<string[]>();
    const byStation: Record<string, Slot<string[]>> = {
      "Kings Cross": kings,
      Paddington: paddington,
    };
    const fetchDepartures = vi.fn((station: string) => byStation[station].promise);

    const { rerender } = render(
      <StationBoard station="Kings Cross" fetchDepartures={fetchDepartures} />,
    );
    expect(
      screen.queryByRole("status"),
      "a request in flight is a state of its own: Loading departures for Kings Cross",
    ).toHaveTextContent("Loading departures for Kings Cross");

    rerender(<StationBoard station="Paddington" fetchDepartures={fetchDepartures} />);
    expect(fetchDepartures, "a new station is a new request").toHaveBeenCalledTimes(2);
    expect(
      screen.queryByRole("status"),
      "and the board is empty again while that request is out - the departures " +
        "of the station you left are not the departures of this one",
    ).toHaveTextContent("Loading departures for Paddington");

    await settle(paddington.promise, () => paddington.resolve(["18:04 Slough", "18:12 Reading"]));
    expect(texts("listitem"), "the answer for the station on screen is shown").toEqual([
      "18:04 Slough",
      "18:12 Reading",
    ]);

    await settle(kings.promise, () => kings.resolve(["18:10 York"]));
    expect(
      texts("listitem"),
      "the first request answered last and it must lose. Promises have no " +
        "cancel button, so the .then you attached to the abandoned request will " +
        "run - the effect that started it has to leave behind a flag saying it " +
        "was retired (README ex1)",
    ).toEqual(["18:04 Slough", "18:12 Reading"]);
  }, 30000);

  test("ex2 - ShipmentTracker ignores the failure of a parcel it stopped watching", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const byId: Record<string, Slot<string>> = { "PX-1": first, "PX-2": second };
    const fetchStatus = vi.fn((trackingId: string) => byId[trackingId].promise);

    const { rerender, unmount } = render(
      <ShipmentTracker trackingId="PX-1" fetchStatus={fetchStatus} />,
    );
    expect(screen.queryByRole("status")).toHaveTextContent("Checking PX-1");

    rerender(<ShipmentTracker trackingId="PX-2" fetchStatus={fetchStatus} />);
    await settle(second.promise, () => second.resolve("Out for delivery"));
    expect(screen.queryByText("Out for delivery"), "the current parcel answers").not.toBeNull();

    await settle(first.promise, () => first.reject(new Error("PX-1 could not be found")));
    expect(
      screen.queryByRole("alert"),
      "the retired request failed, and nobody is waiting for it. A guard that " +
        "protects only the success path lets a dead request post an error over " +
        "a screen that is already correct - the catch needs the same guard " +
        "(README ex2)",
    ).toBeNull();
    expect(
      screen.queryByText("Out for delivery"),
      "and the status the user is actually looking at survives",
    ).not.toBeNull();

    unmount();

    const alone = deferred<string>();
    const fetchAlone = vi.fn(() => alone.promise);
    render(<ShipmentTracker trackingId="PX-9" fetchStatus={fetchAlone} />);
    await settle(alone.promise, () => alone.reject(new Error("PX-9 could not be found")));
    expect(
      screen.queryByRole("alert"),
      "a failure of the parcel that is on screen is still a failure worth " +
        "announcing - the guard suppresses stale answers, not all of them",
    ).toHaveTextContent("PX-9 could not be found");
    expect(screen.queryByRole("status"), "and it is not still checking").toBeNull();
  }, 30000);

  test("ex3 - DocumentPane aborts the request it walked away from", async () => {
    const signals: AbortSignal[] = [];
    const slots: Array<Slot<string>> = [];
    const fetchDoc = vi.fn((_docId: string, signal: AbortSignal) => {
      signals.push(signal);
      const slot = deferred<string>();
      slots.push(slot);
      return slot.promise;
    });

    const { rerender } = render(<DocumentPane docId="d1" fetchDoc={fetchDoc} />);
    expect(signals.length, "one render, one request, one signal").toBe(1);
    expect(signals[0].aborted, "nothing has been abandoned yet").toBe(false);

    rerender(<DocumentPane docId="d2" fetchDoc={fetchDoc} />);
    expect(
      signals[0].aborted,
      "a flag stops a stale answer from being used; an AbortController stops " +
        "the work from continuing at all. The cleanup of the effect that " +
        "started the request is where you abort it (README ex3)",
    ).toBe(true);
    expect(
      signals[1].aborted,
      "and the request the component is still waiting for must not be aborted",
    ).toBe(false);

    await settle(slots[1].promise, () => slots[1].resolve("Deployment runbook"));
    expect(screen.queryByText("Deployment runbook"), "the live request answers").not.toBeNull();

    await settle(slots[0].promise, () =>
      slots[0].reject(new DOMException("The operation was aborted.", "AbortError")),
    );
    expect(
      screen.queryByRole("alert"),
      "an abort you asked for is not a failure to report to the user - a " +
        "catch-all error branch turns your own cleanup into an error message",
    ).toBeNull();
    expect(screen.queryByText("Deployment runbook"), "and the document stays").not.toBeNull();
  }, 30000);

  test("ex4 - SymbolSearch answers the ticker in the box, whatever order the answers arrive", async () => {
    const slots = new Map<string, Slot<string>>();
    const lookup = vi.fn((ticker: string) => {
      const slot = deferred<string>();
      slots.set(ticker, slot);
      return slot.promise;
    });

    render(<SymbolSearch lookup={lookup} />);
    const box = screen.getByLabelText("Ticker");
    expect(
      screen.queryByRole("status"),
      "an empty box is not a search: Type a ticker",
    ).toHaveTextContent("Type a ticker");
    expect(lookup, "and nothing is asked for").not.toHaveBeenCalled();

    fireEvent.change(box, { target: { value: "AC" } });
    expect(lookup, "typing asks about what is in the box").toHaveBeenLastCalledWith("AC");
    expect(screen.queryByRole("status")).toHaveTextContent("Searching for AC");

    fireEvent.change(box, { target: { value: "ACM" } });
    expect(lookup, "and again for the next thing in it").toHaveBeenLastCalledWith("ACM");

    await settle(slots.get("ACM")!.promise, () => slots.get("ACM")!.resolve("ACME Corporation"));
    expect(screen.queryByText("ACME Corporation"), "the current query answers").not.toBeNull();

    await settle(slots.get("AC")!.promise, () => slots.get("AC")!.resolve("AC Delco"));
    expect(
      screen.queryByText("ACME Corporation"),
      "the shorter query was typed first and answered last. A race started by a " +
        "keystroke is the same race as one started by a prop, and it needs the " +
        "same guard - the query the answer belongs to has to be checked before " +
        "the answer is shown (README ex4)",
    ).not.toBeNull();
    expect(screen.queryByText("AC Delco"), "and the superseded answer is never shown").toBeNull();

    fireEvent.change(box, { target: { value: "" } });
    expect(
      screen.queryByRole("status"),
      "emptying the box goes back to the beginning",
    ).toHaveTextContent("Type a ticker");
    expect(screen.queryByText("ACME Corporation"), "with no result left over").toBeNull();
    expect(lookup, "and no request for the empty string").toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex5 - AccountBalance shows the newest answer, not the newest arrival", async () => {
    const user = userEvent.setup();
    const slots: Array<Slot<number>> = [];
    const fetchBalance = vi.fn(() => {
      const slot = deferred<number>();
      slots.push(slot);
      return slot.promise;
    });

    render(<AccountBalance accountId="acc-7" fetchBalance={fetchBalance} />);
    await settle(slots[0].promise, () => slots[0].resolve(100));
    expect(screen.queryByText("Balance: 100"), "the first answer is shown").not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(fetchBalance, "two impatient clicks are two requests").toHaveBeenCalledTimes(3);

    await settle(slots[2].promise, () => slots[2].resolve(300));
    expect(screen.queryByText("Balance: 300"), "the second click answers first").not.toBeNull();

    await settle(slots[1].promise, () => slots[1].resolve(200));
    expect(
      screen.queryByText("Balance: 300"),
      "the first click answers last and it is older, so it loses. No prop and " +
        "no state changed between those two clicks, so there was no cleanup to " +
        "run - the component has to number its own requests and remember which " +
        "number is current (README ex5)",
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await settle(slots[3].promise, () => slots[3].resolve(250));
    expect(
      screen.queryByText("Balance: 250"),
      "and the next refresh still works - ignoring everything after one late " +
        "answer is not the same as ignoring the late answer",
    ).not.toBeNull();
  }, 30000);

  test("ex6 - PollenIndex gives every run of the effect its own flag", async () => {
    const slots = new Map<string, Slot<string>>();
    const fetchIndex = vi.fn((city: string) => {
      const slot = deferred<string>();
      slots.set(city, slot);
      return slot.promise;
    });
    const answer = async (city: string, value: string) => {
      const slot = slots.get(city)!;
      await settle(slot.promise, () => slot.resolve(value));
    };

    const { rerender } = render(<PollenIndex city="Oslo" fetchIndex={fetchIndex} />);
    expect(screen.queryByRole("status")).toHaveTextContent("Checking Oslo");

    await answer("Oslo", "Low");
    expect(screen.queryByText("Pollen in Oslo: Low"), "the first city answers").not.toBeNull();

    rerender(<PollenIndex city="Kyoto" fetchIndex={fetchIndex} />);
    await answer("Kyoto", "High");
    expect(
      screen.queryByText("Pollen in Kyoto: High"),
      "the second city answers too. A guard kept in a ref is one flag shared by " +
        "every run of the effect: the cleanup that retired Oslo set it, and " +
        "nothing ever unset it, so Kyoto is ignored and the component never " +
        "updates again. The flag belongs inside the effect body (README ex6)",
    ).not.toBeNull();

    rerender(<PollenIndex city="Lima" fetchIndex={fetchIndex} />);
    rerender(<PollenIndex city="Cairo" fetchIndex={fetchIndex} />);
    await answer("Lima", "Medium");
    expect(
      screen.queryByRole("status"),
      "Lima was abandoned before it answered, so its answer changes nothing",
    ).toHaveTextContent("Checking Cairo");

    await answer("Cairo", "Very high");
    expect(screen.queryByText("Pollen in Cairo: Very high"), "and Cairo lands").not.toBeNull();
  }, 30000);

  test("ex7 - ItineraryPanel abandons a whole chain, not just its last step", async () => {
    type Trip = { id: string; traveller: string };
    const trips = new Map<string, Slot<Trip>>();
    const legs = new Map<string, Slot<string[]>>();
    const fetchTrip = vi.fn((tripId: string) => {
      const slot = deferred<Trip>();
      trips.set(tripId, slot);
      return slot.promise;
    });
    const fetchLegs = vi.fn((tripId: string) => {
      const slot = deferred<string[]>();
      legs.set(tripId, slot);
      return slot.promise;
    });

    const { rerender } = render(
      <ItineraryPanel tripId="t1" fetchTrip={fetchTrip} fetchLegs={fetchLegs} />,
    );
    expect(fetchTrip, "the first step goes out").toHaveBeenCalledWith("t1");
    expect(fetchLegs, "the second cannot, it has nothing to go on").not.toHaveBeenCalled();

    rerender(<ItineraryPanel tripId="t2" fetchTrip={fetchTrip} fetchLegs={fetchLegs} />);
    await settle(trips.get("t1")!.promise, () => trips.get("t1")!.resolve({ id: "t1", traveller: "Rosa" }));
    expect(
      fetchLegs,
      "the trip the user left came back, and the chain must stop there. A guard " +
        "checked only before the last setState still fires the second request, " +
        "which costs a round trip nobody will ever look at (README ex7)",
    ).not.toHaveBeenCalled();

    await settle(trips.get("t2")!.promise, () => trips.get("t2")!.resolve({ id: "t2", traveller: "Nils" }));
    expect(fetchLegs, "the live chain does continue").toHaveBeenCalledTimes(1);
    expect(fetchLegs, "with the id the first step gave it").toHaveBeenLastCalledWith("t2");
    expect(screen.queryByRole("status"), "and half-loaded is still loading").toHaveTextContent(
      "Loading itinerary",
    );

    await settle(legs.get("t2")!.promise, () => legs.get("t2")!.resolve(["Oslo to Bergen", "Bergen to Tromso"]));
    expect(screen.queryByRole("heading", { name: "Nils" }), "then the traveller").not.toBeNull();
    expect(texts("listitem"), "and the legs").toEqual(["Oslo to Bergen", "Bergen to Tromso"]);
    expect(screen.queryByRole("status"), "with no loading left over").toBeNull();
  }, 30000);

  test("ex8 - MetricTabs files every answer under the tab that asked for it", async () => {
    const user = userEvent.setup();
    const slots = new Map<string, Slot<string>>();
    const fetchMetric = vi.fn((metric: string) => {
      const slot = deferred<string>();
      slots.set(metric, slot);
      return slot.promise;
    });
    const answer = async (metric: string, value: string) => {
      const slot = slots.get(metric)!;
      await settle(slot.promise, () => slot.resolve(value));
    };

    render(<MetricTabs fetchMetric={fetchMetric} />);
    expect(fetchMetric, "the tab that starts selected is the one that loads").toHaveBeenCalledWith(
      "Traffic",
    );
    expect(screen.queryByRole("status")).toHaveTextContent("Loading Traffic");

    await user.click(screen.getByRole("button", { name: "Signups" }));
    expect(fetchMetric, "a tab with nothing behind it has to ask").toHaveBeenCalledWith("Signups");
    expect(screen.queryByRole("status")).toHaveTextContent("Loading Signups");

    await answer("Traffic", "18204 visits");
    expect(
      screen.queryByText("18204 visits"),
      "Traffic answered after the user left it. The answer is still true and " +
        "worth keeping - but it is not the answer to the question on screen, " +
        "and showing it is the race (README ex8)",
    ).toBeNull();
    expect(screen.queryByRole("status"), "Signups is still the question").toHaveTextContent(
      "Loading Signups",
    );

    await answer("Signups", "412 signups");
    expect(screen.queryByText("412 signups"), "and Signups answers it").not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Traffic" }));
    expect(
      screen.queryByText("18204 visits"),
      "going back shows the late answer instantly, because it was filed under " +
        "Traffic when it arrived rather than thrown away",
    ).not.toBeNull();
    expect(
      fetchMetric,
      "and nothing was asked twice - two tabs opened, two requests, ever",
    ).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Revenue" }));
    expect(fetchMetric, "a tab nobody has opened is a third request").toHaveBeenCalledTimes(3);
    await answer("Revenue", "31400 euros");
    expect(screen.queryByText("31400 euros"), "which lands where it belongs").not.toBeNull();
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d14_refs_dom**, where the thing you are reaching for is not a request
but a DOM node.
