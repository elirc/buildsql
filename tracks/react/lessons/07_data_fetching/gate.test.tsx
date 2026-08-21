// Gate for react/07_data_fetching. Quoted verbatim in README.md.
//
// Nothing here touches the network. Every component takes its fetcher as a
// prop, so the gate can hand it a promise it controls by hand - which is the
// only way to test "the slow one came back last" deterministically.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { UserCard } from "./ex1/solution";
import { Profile } from "./ex2/solution";
import { ProfileViewer } from "./ex3/solution";
import { RetryableUser } from "./ex4/solution";
import { PaginatedList } from "./challenge/solution";
import { SearchResults } from "./review1/solution";

type User = { name: string };

/** A promise plus the handles to settle it whenever the test likes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Settle a deferred and let React process everything that follows. */
async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

describe("07_data_fetching", () => {
  test("ex1 - UserCard shows a loading state and then the data", async () => {
    const request = deferred<User>();
    render(<UserCard userId="1" fetchUser={() => request.promise} />);

    expect(
      screen.queryByRole("status"),
      "while the request is in flight the user needs to be told something is " +
        'happening - a live region reading Loading (README ex1)',
    ).toHaveTextContent("Loading");

    await settle(request.promise, () => request.resolve({ name: "Ada" }));

    expect(
      screen.queryByRole("status"),
      "once the data has arrived the loading region must go away",
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "and the name appears in a level-2 heading",
    ).toHaveTextContent("Ada");
  });

  test("ex2 - Profile reports a failed request instead of hanging", async () => {
    const failing = deferred<User>();
    const first = render(<Profile userId="1" fetchUser={() => failing.promise} />);

    await settle(failing.promise, () => failing.reject(new Error("User not found")));

    const alert = screen.queryByRole("alert");
    expect(
      alert,
      "a rejected promise has to become a visible error. Without a .catch (or " +
        "try/catch) the component sits on Loading forever and the failure is " +
        "only in the console (README ex2)",
    ).not.toBeNull();
    expect(alert, "show the error's message, not a generic string").toHaveTextContent(
      "User not found",
    );
    expect(
      screen.queryByRole("status"),
      "loading has to stop when the request fails, not only when it succeeds",
    ).toBeNull();
    first.unmount();

    const working = deferred<User>();
    render(<Profile userId="2" fetchUser={() => working.promise} />);
    await settle(working.promise, () => working.resolve({ name: "Lin" }));

    expect(screen.queryByRole("alert"), "a successful request shows no error").toBeNull();
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "and the name is rendered as before",
    ).toHaveTextContent("Lin");
  });

  test("ex3 - ProfileViewer ignores an answer to a question it stopped asking", async () => {
    const slow = deferred<User>();
    const quick = deferred<User>();
    const fetchUser = vi.fn((id: string) => (id === "1" ? slow.promise : quick.promise));

    const { rerender } = render(<ProfileViewer userId="1" fetchUser={fetchUser} />);
    rerender(<ProfileViewer userId="2" fetchUser={fetchUser} />);

    await settle(quick.promise, () => quick.resolve({ name: "Second" }));
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "the second user's request came back first and should be on screen",
    ).toHaveTextContent("Second");

    await settle(slow.promise, () => slow.resolve({ name: "First" }));
    expect(
      screen.queryByRole("heading", { level: 2 }),
      "the FIRST user's request has just landed, late, and overwritten the " +
        "screen with data nobody asked for any more. The effect that started it " +
        "was cleaned up when the id changed - use that cleanup to make its " +
        "result irrelevant (README ex3)",
    ).toHaveTextContent("Second");
    expect(
      screen.queryByText("First"),
      "no trace of the stale user should reach the DOM",
    ).toBeNull();
  });

  test("ex4 - RetryableUser can be asked again after a failure", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    const fetchUser = vi.fn(async (): Promise<User> => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("Network error");
      }
      return { name: "Ada" };
    });

    render(<RetryableUser userId="1" fetchUser={fetchUser} />);

    expect(
      await screen.findByRole("alert"),
      "the first attempt fails, so an error region appears",
    ).toHaveTextContent("Network error");

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { level: 2 }),
      "Try again must run the same request a second time - which means the " +
        "fetching logic has to be callable from an event handler as well as " +
        "from the effect",
    ).toHaveTextContent("Ada");
    expect(screen.queryByRole("alert"), "and the old error has to be cleared").toBeNull();
    expect(fetchUser, "exactly two requests: the original and the retry").toHaveBeenCalledTimes(2);
  }, 20000);

  test("challenge - PaginatedList walks forwards and backwards", async () => {
    const user = userEvent.setup();
    const pages: Record<number, { items: string[]; hasMore: boolean }> = {
      1: { items: ["Apples", "Apricots"], hasMore: true },
      2: { items: ["Bananas"], hasMore: false },
    };
    const fetchPage = vi.fn(async (page: number) => pages[page]);

    render(<PaginatedList fetchPage={fetchPage} />);

    expect(await screen.findByText("Apples"), "page 1 loads on mount").toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous" }),
      "there is no page before the first one",
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Bananas"), "Next loads the following page").toBeInTheDocument();
    expect(
      screen.queryByText("Apples"),
      "page 1 must be gone - showing two pages at once means the items were " +
        "appended instead of replaced",
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Next" }),
      "the server said hasMore is false, so there is nowhere left to go",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" }), "but back is fine now").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Apples"), "and back works").toBeInTheDocument();
    expect(
      fetchPage,
      "three navigations, three requests - the page number is the only state " +
        "that drives fetching (README challenge)",
    ).toHaveBeenCalledTimes(3);
  }, 20000);

  test("review1 - SearchResults keeps the results of the current query", async () => {
    const slow = deferred<string[]>();
    const quick = deferred<string[]>();
    const fetchResults = vi.fn((query: string) => (query === "re" ? slow.promise : quick.promise));

    const { rerender } = render(<SearchResults query="re" fetchResults={fetchResults} />);
    rerender(<SearchResults query="react" fetchResults={fetchResults} />);

    await settle(quick.promise, () => quick.resolve(["react", "react-dom"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the current query's results should be listed",
    ).toEqual(["react", "react-dom"]);

    await settle(slow.promise, () => slow.resolve(["redux", "remix"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the results for the abandoned query arrived late and replaced the list. " +
        "This is what a search box does to you every single time somebody types " +
        "quickly - guard the update with the effect's cleanup",
    ).toEqual(["react", "react-dom"]);
  });
});
