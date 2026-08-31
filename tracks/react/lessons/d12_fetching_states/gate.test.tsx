// Gate for react/d12_fetching_states. Quoted verbatim in README.md.
//
// Every request in this set is an injected function returning a promise the
// gate resolves by hand, so nothing here depends on the network, on timing or
// on how fast the machine is.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { WeatherCard } from "./ex1/solution";
import { InvoiceView } from "./ex2/solution";
import { SearchPanel } from "./ex3/solution";
import { StockLevel } from "./ex4/solution";
import { TicketView } from "./ex5/solution";
import { RateBoard } from "./ex6/solution";
import { CustomerOrders } from "./ex7/solution";
import { ActivityFeed } from "./ex8/solution";

function deferred<T>() {
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

describe("d12_fetching_states", () => {
  test("ex1 - WeatherCard says it is loading before it says anything else", async () => {
    const weather = deferred<{ tempC: number; summary: string }>();
    const fetchWeather = vi.fn(() => weather.promise);
    render(<WeatherCard city="Lisbon" fetchWeather={fetchWeather} />);

    expect(
      fetchWeather,
      "one render, one request, and the city is what you ask about",
    ).toHaveBeenCalledWith("Lisbon");
    expect(
      screen.queryByRole("status"),
      "a request that has not answered yet is a state of its own, and the user " +
        "is owed a live region saying so: Loading weather for Lisbon " +
        "(README ex1)",
    ).toHaveTextContent("Loading weather for Lisbon");

    await settle(weather.promise, () => weather.resolve({ tempC: 12, summary: "Cloudy" }));

    expect(
      screen.queryByText("12C, Cloudy"),
      "once the promise settles the data replaces the placeholder",
    ).not.toBeNull();
    expect(
      screen.queryByRole("status"),
      "and the loading message goes away - leaving it on screen next to the " +
        "answer is the commonest version of this bug",
    ).toBeNull();
  });

  test("ex2 - InvoiceView turns a rejected promise into a message, not a spinner forever", async () => {
    const invoice = deferred<{ total: string }>();
    const load = vi.fn(() => invoice.promise);
    render(<InvoiceView invoiceId="INV-42" load={load} />);

    expect(screen.queryByRole("status"), "loading first, as always").toHaveTextContent(
      "Loading invoice INV-42",
    );

    await settle(invoice.promise, () => invoice.reject(new Error("Invoice INV-42 is not available")));

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      "a failed request has to be caught and shown, in a role=alert so it is " +
        "announced. A promise with only a then branch leaves the user watching " +
        "a spinner that will never stop (README ex2)",
    ).not.toBeNull();
    expect(
      alert,
      "and the message the request failed with is the useful part",
    ).toHaveTextContent("Invoice INV-42 is not available");
    expect(
      screen.queryByRole("status"),
      "failed is not still loading - the two states are exclusive",
    ).toBeNull();
  });

  test("ex3 - SearchPanel tells an empty answer apart from no answer yet", async () => {
    const first = deferred<string[]>();
    const second = deferred<string[]>();
    const search = vi.fn((query: string) => (query === "coffee" ? first.promise : second.promise));
    const { rerender } = render(<SearchPanel query="coffee" search={search} />);

    await settle(first.promise, () => first.resolve([]));

    expect(
      screen.queryByText("No matches for coffee"),
      "zero results is a successful answer and needs its own words. Falling " +
        "back to the loading state, or to nothing at all, tells the user the " +
        "app is broken (README ex3)",
    ).not.toBeNull();
    expect(screen.queryAllByRole("listitem").length, "and there is no list to show").toBe(0);

    rerender(<SearchPanel query="beans" search={search} />);
    expect(
      search,
      "a new query is a new request - the effect depends on the query",
    ).toHaveBeenLastCalledWith("beans");

    await settle(second.promise, () => second.resolve(["Green beans", "Roasted beans"]));

    expect(
      screen.queryAllByRole("listitem").map((item) => item.textContent),
      "the results are listed",
    ).toEqual(["Green beans", "Roasted beans"]);
    expect(
      screen.queryByText("No matches for beans"),
      "and the empty message is gone now that there is something to show",
    ).toBeNull();
  });

  test("ex4 - StockLevel can be asked again, but not twice at once", async () => {
    const user = userEvent.setup();
    const first = deferred<number>();
    const second = deferred<number>();
    const calls: Array<ReturnType<typeof deferred<number>>> = [first, second];
    const fetchLevel = vi.fn(() => calls.shift()!.promise);
    render(<StockLevel sku="BEAN-1" fetchLevel={fetchLevel} />);

    await settle(first.promise, () => first.resolve(7));
    expect(screen.queryByText("In stock: 7"), "the first answer is shown").not.toBeNull();

    const refresh = screen.getByRole("button", { name: "Refresh" });
    expect(refresh, "with nothing in flight the button is available").toBeEnabled();

    await user.click(refresh);
    expect(fetchLevel, "clicking Refresh asks again").toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "Refresh" }),
      "while a request is in flight the button that starts it must be " +
        "disabled, or an impatient user queues up five of them (README ex4)",
    ).toBeDisabled();
    expect(
      screen.queryByText("In stock: 7"),
      "the number the user is looking at does not vanish while it is being " +
        "checked",
    ).not.toBeNull();

    await settle(second.promise, () => second.resolve(5));
    expect(screen.queryByText("In stock: 5"), "the fresh number replaces it").not.toBeNull();
    expect(screen.getByRole("button", { name: "Refresh" }), "and the button comes back").toBeEnabled();
  }, 30000);

  test("ex5 - TicketView clears the error before it retries", async () => {
    const user = userEvent.setup();
    const first = deferred<{ subject: string }>();
    const second = deferred<{ subject: string }>();
    const calls = [first, second];
    const load = vi.fn(() => calls.shift()!.promise);
    render(<TicketView ticketId="T-9" load={load} />);

    await settle(first.promise, () => first.reject(new Error("Server said no")));
    expect(screen.queryByRole("alert"), "the first attempt failed").toHaveTextContent(
      "Server said no",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      screen.queryByRole("alert"),
      "a retry that leaves the old error on screen beside the new spinner " +
        "reads as two failures. Reset the error when you start the next " +
        "attempt (README ex5)",
    ).toBeNull();
    expect(screen.queryByRole("status"), "and the retry is loading").toHaveTextContent(
      "Loading ticket T-9",
    );

    await settle(second.promise, () => second.resolve({ subject: "Grinder is jammed" }));
    expect(screen.queryByText("Grinder is jammed"), "then it succeeds").not.toBeNull();
    expect(screen.queryByRole("alert"), "with no error left over").toBeNull();
    expect(screen.queryByRole("status"), "and no loading left over").toBeNull();
  }, 30000);

  test("ex6 - RateBoard keeps the old rate on screen while it fetches the new one", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const calls = [first, second];
    const fetchRate = vi.fn(() => calls.shift()!.promise);
    const { rerender } = render(<RateBoard pair="USD/EUR" fetchRate={fetchRate} />);

    const region = () => screen.getByRole("region", { name: "Exchange rate" });
    expect(
      region(),
      "with nothing fetched yet there is nothing to keep, so the first load " +
        "says Loading rates",
    ).toHaveTextContent("Loading rates");
    expect(region(), "and the region reports that it is busy").toHaveAttribute("aria-busy", "true");

    await settle(first.promise, () => first.resolve("1 USD = 0.92 EUR"));
    expect(region()).toHaveTextContent("1 USD = 0.92 EUR");
    expect(region(), "settled means not busy").toHaveAttribute("aria-busy", "false");

    rerender(<RateBoard pair="USD/GBP" fetchRate={fetchRate} />);
    expect(
      region(),
      "a refresh must not blank the screen. Keep showing what you have, mark " +
        "the region busy, and swap the value when the answer arrives - that is " +
        "the whole of stale-while-revalidate (README ex6)",
    ).toHaveTextContent("1 USD = 0.92 EUR");
    expect(region(), "while the new request is in flight the region is busy").toHaveAttribute(
      "aria-busy",
      "true",
    );

    await settle(second.promise, () => second.resolve("1 USD = 0.79 GBP"));
    expect(region(), "and only then does the number change").toHaveTextContent("1 USD = 0.79 GBP");
    expect(region()).toHaveAttribute("aria-busy", "false");
  });

  test("ex7 - CustomerOrders waits for the first answer before it asks the second question", async () => {
    const customer = deferred<{ id: string; name: string }>();
    const orders = deferred<string[]>();
    const fetchCustomer = vi.fn(() => customer.promise);
    const fetchOrders = vi.fn(() => orders.promise);
    const { unmount } = render(
      <CustomerOrders customerId="c1" fetchCustomer={fetchCustomer} fetchOrders={fetchOrders} />,
    );

    expect(
      fetchOrders,
      "the orders request needs the id the first request returns, so it cannot " +
        "have gone out yet (README ex7)",
    ).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toHaveTextContent("Loading customer");

    await settle(customer.promise, () => customer.resolve({ id: "c1", name: "Ada Lovelace" }));
    expect(fetchOrders, "now it goes out, with what the first answer gave it").toHaveBeenCalledWith(
      "c1",
    );
    expect(
      screen.queryByRole("status"),
      "half-loaded is still loading: one status covers both requests, or the " +
        "user sees a name flash up above an empty list",
    ).not.toBeNull();

    await settle(orders.promise, () => orders.resolve(["A-1", "A-2"]));
    expect(screen.queryByText("Ada Lovelace"), "then the customer appears").not.toBeNull();
    expect(
      screen.queryAllByRole("listitem").map((item) => item.textContent),
      "with their orders",
    ).toEqual(["A-1", "A-2"]);
    expect(screen.queryByRole("status"), "and the loading state is over").toBeNull();

    unmount();

    const missing = deferred<{ id: string; name: string }>();
    const fetchMissing = vi.fn(() => missing.promise);
    const fetchOrdersAgain = vi.fn(() => deferred<string[]>().promise);
    render(
      <CustomerOrders
        customerId="c2"
        fetchCustomer={fetchMissing}
        fetchOrders={fetchOrdersAgain}
      />,
    );

    await settle(missing.promise, () => missing.reject(new Error("No such customer")));
    expect(screen.queryByRole("alert"), "a failed first step is reported").toHaveTextContent(
      "No such customer",
    );
    expect(
      fetchOrdersAgain,
      "and the second request never goes out, because the value it needed " +
        "never arrived - a chain that fires anyway asks the server for the " +
        "orders of undefined",
    ).not.toHaveBeenCalled();
  });

  test("ex8 - ActivityFeed adds a page, survives a failed one, and knows when to stop", async () => {
    const user = userEvent.setup();
    const calls: Array<ReturnType<typeof deferred<{ items: string[]; hasMore: boolean }>>> = [];
    const fetchPage = vi.fn((_page: number) => {
      const next = deferred<{ items: string[]; hasMore: boolean }>();
      calls.push(next);
      return next.promise;
    });
    render(<ActivityFeed fetchPage={fetchPage} />);

    await settle(calls[0].promise, () =>
      calls[0].resolve({ items: ["Signed in", "Changed plan"], hasMore: true }),
    );
    expect(
      screen.queryAllByRole("listitem").map((item) => item.textContent),
      "page one is listed",
    ).toEqual(["Signed in", "Changed plan"]);

    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchPage, "Load more asks for page 2, by number").toHaveBeenLastCalledWith(2);
    expect(
      screen.queryAllByRole("listitem").length,
      "the page the user has already read stays on screen while the next one " +
        "loads (README ex8)",
    ).toBe(2);

    await settle(calls[1].promise, () => calls[1].reject(new Error("Page 2 failed")));
    expect(screen.queryByRole("alert"), "the failure is reported").toHaveTextContent(
      "Page 2 failed",
    );
    expect(
      screen.queryAllByRole("listitem").length,
      "and page one is still there - a failed page must not throw away what " +
        "already loaded",
    ).toBe(2);
    expect(
      screen.queryByRole("button", { name: "Load more" }),
      "while a page is broken the only sensible offer is to try that page " +
        "again, so Load more gives way to Retry",
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      fetchPage,
      "the retry asks for the page that failed, not for page 3",
    ).toHaveBeenLastCalledWith(2);

    await settle(calls[2].promise, () =>
      calls[2].resolve({ items: ["Invited a teammate"], hasMore: false }),
    );
    expect(
      screen.queryAllByRole("listitem").map((item) => item.textContent),
      "the retried page is appended to the first one, not swapped for it",
    ).toEqual(["Signed in", "Changed plan", "Invited a teammate"]);
    expect(screen.queryByRole("alert"), "the error is cleared").toBeNull();
    expect(
      screen.queryByRole("button", { name: "Load more" }),
      "and when the server says there is no more, the button that asks for " +
        "more has no reason to exist",
    ).toBeNull();
  }, 30000);
});
