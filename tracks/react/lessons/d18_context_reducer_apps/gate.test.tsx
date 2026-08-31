// Gate for react/d18_context_reducer_apps. Quoted verbatim in README.md.
//
// Every exercise here is a small application: one provider holding a reducer,
// and consumers the gate scatters through the tree. No consumer is ever given
// a prop that carries state, so the context is the only wiring there is.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { ToastProvider, ToastTrigger, ToastList } from "./ex1/solution";
import { WishlistProvider, WishlistToggle, WishlistCount } from "./ex2/solution";
import { FlowProvider, FlowSteps, FlowNav } from "./ex3/solution";
import { SelectionProvider, SelectAllBox, RowBox } from "./ex4/solution";
import { AuthProvider, SignInForm, AuthStatus } from "./ex5/solution";
import { DraftProvider, DraftEditor, DraftCount } from "./ex6/solution";
import { NotesProvider, NotesEditor, HistoryBar } from "./ex7/solution";
import { BasketProvider, AddToBasket, BasketLines, BasketTotal } from "./ex8/solution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);
const names = (pattern: RegExp) =>
  screen.queryAllByRole("button", { name: pattern }).map((node) => node.textContent);

/** A few levels of ordinary markup, so nothing can arrive as a prop. */
function Deep({ children }: { children: ReactNode }) {
  return (
    <div>
      <section>{children}</section>
    </div>
  );
}

describe("d18_context_reducer_apps", () => {
  test("ex1 - ToastList dismisses the toast that was asked for", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Deep>
          <ToastTrigger message="Saved" />
          <ToastTrigger message="Sent" />
          <ToastTrigger message="Queued" />
          <ToastTrigger message="Later" />
        </Deep>
        <Deep>
          <ToastList />
        </Deep>
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Notify Saved" }));
    await user.click(screen.getByRole("button", { name: "Notify Sent" }));
    await user.click(screen.getByRole("button", { name: "Notify Queued" }));
    expect(names(/^Dismiss/), "three notifications, three toasts").toEqual([
      "Dismiss Saved",
      "Dismiss Sent",
      "Dismiss Queued",
    ]);

    await user.click(screen.getByRole("button", { name: "Dismiss Sent" }));
    expect(names(/^Dismiss/), "and the one dismissed is the one that goes").toEqual([
      "Dismiss Saved",
      "Dismiss Queued",
    ]);

    await user.click(screen.getByRole("button", { name: "Notify Later" }));
    expect(names(/^Dismiss/), "a fourth toast joins the two that are left").toEqual([
      "Dismiss Saved",
      "Dismiss Queued",
      "Dismiss Later",
    ]);

    await user.click(screen.getByRole("button", { name: "Dismiss Later" }));
    expect(
      names(/^Dismiss/),
      "an id taken from the length of the list is not an id: once anything has " +
        "been dismissed, the next toast is handed a number that is already in " +
        "use, and dismissing it takes an innocent toast with it. Ids come from " +
        "a counter the reducer owns (README ex1)",
    ).toEqual(["Dismiss Saved", "Dismiss Queued"]);
  }, 30000);

  test("ex2 - two toggles for one item always agree", async () => {
    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <Deep>
          <WishlistToggle item="Kettle" />
          <WishlistToggle item="Grinder" />
        </Deep>
        <Deep>
          <WishlistToggle item="Kettle" />
        </Deep>
        <Deep>
          <WishlistCount />
        </Deep>
      </WishlistProvider>,
    );

    expect(screen.getByRole("status"), "nothing saved yet").toHaveTextContent("0 saved");
    expect(names(/Kettle/), "and both Kettle buttons offer to save it").toEqual([
      "Save Kettle",
      "Save Kettle",
    ]);

    await user.click(screen.getAllByRole("button", { name: "Save Kettle" })[0]);
    expect(
      names(/Kettle/),
      "the same kettle is on the wishlist wherever it appears. A toggle that " +
        "keeps its own boolean is a second copy of a fact the provider already " +
        "owns, and the two copies disagree the moment one of them is clicked " +
        "(README ex2)",
    ).toEqual(["Saved Kettle", "Saved Kettle"]);
    expect(screen.getByRole("status"), "one item saved").toHaveTextContent("1 saved");

    await user.click(screen.getByRole("button", { name: "Save Grinder" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 saved");

    await user.click(screen.getAllByRole("button", { name: "Saved Kettle" })[1]);
    expect(names(/Kettle/), "and unsaving it from either place unsaves it").toEqual([
      "Save Kettle",
      "Save Kettle",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("1 saved");
  }, 30000);

  test("ex3 - FlowNav will not let you past a step that is not done", async () => {
    const user = userEvent.setup();
    render(
      <FlowProvider>
        <Deep>
          <FlowSteps />
        </Deep>
        <Deep>
          <FlowNav />
        </Deep>
      </FlowProvider>,
    );

    expect(screen.getByRole("button", { name: "Back" }), "there is nothing behind step one").toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next" }),
      "the email is empty, so there is nothing to confirm yet. The guard lives " +
        "in the provider, because the button and the field it depends on are in " +
        "different branches of the tree (README ex3)",
    ).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    expect(screen.getByRole("button", { name: "Next" }), "now there is").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status"), "step two shows what will be used").toHaveTextContent(
      "Confirm ada@example.com",
    );
    expect(screen.getByRole("button", { name: "Back" }), "and going back is possible now").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(screen.getByRole("button", { name: "Next" }), "and there is no step four").toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Email"), "walking back finds the email still there").toHaveValue(
      "ada@example.com",
    );
  }, 30000);

  test("ex4 - SelectAllBox reports half a selection as half", async () => {
    const user = userEvent.setup();
    render(
      <SelectionProvider ids={["Alpha", "Bravo", "Charlie"]}>
        <Deep>
          <SelectAllBox />
        </Deep>
        <Deep>
          <RowBox id="Alpha" />
          <RowBox id="Bravo" />
          <RowBox id="Charlie" />
        </Deep>
      </SelectionProvider>,
    );

    const all = () => screen.getByRole("checkbox", { name: "All" });
    expect(all(), "nothing is selected").not.toBeChecked();
    expect(all(), "and nothing is half-selected either").not.toBePartiallyChecked();

    await user.click(screen.getByRole("checkbox", { name: "Bravo" }));
    expect(
      all(),
      "one row of three is neither all nor none, and a checkbox has a third " +
        "state for exactly that. It is a DOM property rather than an attribute, " +
        "so it takes a ref to set (README ex4)",
    ).toBePartiallyChecked();

    await user.click(screen.getByRole("checkbox", { name: "Alpha" }));
    await user.click(screen.getByRole("checkbox", { name: "Charlie" }));
    expect(all(), "all three is checked, properly").toBeChecked();
    expect(all(), "and no longer partial").not.toBePartiallyChecked();

    await user.click(all());
    expect(
      screen.queryAllByRole("checkbox", { checked: true }),
      "clicking a fully checked select-all clears everything",
    ).toEqual([]);

    await user.click(screen.getByRole("checkbox", { name: "Bravo" }));
    await user.click(all());
    expect(
      screen.queryAllByRole("checkbox", { name: /Alpha|Bravo|Charlie/, checked: true }).length,
      "and clicking it while it is partial selects the rest rather than " +
        "clearing the one that was already chosen",
    ).toBe(3);
  }, 30000);

  test("ex5 - AuthStatus goes through pending on the way to a name", async () => {
    const user = userEvent.setup();
    const first = deferred<string>();
    const signIn = vi.fn(() => first.promise);

    const { unmount } = render(
      <AuthProvider signIn={signIn}>
        <Deep>
          <SignInForm />
        </Deep>
        <Deep>
          <AuthStatus />
        </Deep>
      </AuthProvider>,
    );

    expect(screen.getByRole("status"), "nobody is signed in").toHaveTextContent("Signed out");

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn, "the request goes out with the email that was typed").toHaveBeenCalledWith(
      "ada@example.com",
    );
    expect(
      screen.getByRole("status"),
      "a request in flight is a state the reducer has to hold, or the user " +
        "presses the button and nothing on screen changes for a second " +
        "(README ex5)",
    ).toHaveTextContent("Signing in");
    expect(
      screen.getByRole("button", { name: "Sign in" }),
      "and the button that started it is closed while it runs",
    ).toBeDisabled();

    await settle(first.promise, () => first.resolve("Ada"));
    expect(screen.getByRole("status"), "then the name arrives").toHaveTextContent("Hello Ada");
    expect(screen.queryByRole("button", { name: "Sign in" }), "and the form is done").toBeNull();

    unmount();

    const second = deferred<string>();
    render(
      <AuthProvider signIn={() => second.promise}>
        <Deep>
          <SignInForm />
        </Deep>
        <Deep>
          <AuthStatus />
        </Deep>
      </AuthProvider>,
    );
    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await settle(second.promise, () => second.reject(new Error("Unknown email")));

    expect(
      screen.queryByRole("alert"),
      "a rejected sign-in is a state too, and it is the one people forget - " +
        "leaving the user watching a disabled button for ever",
    ).toHaveTextContent("Unknown email");
    expect(
      screen.getByRole("button", { name: "Sign in" }),
      "and the button comes back so they can try again",
    ).toBeEnabled();
  }, 30000);

  test("ex6 - DraftProvider reads the store once and writes only real changes", async () => {
    const user = userEvent.setup();
    const store = { load: vi.fn(() => "Hello"), save: vi.fn() };

    const { rerender } = render(
      <DraftProvider store={store} label="Note">
        <Deep>
          <DraftEditor />
        </Deep>
        <Deep>
          <DraftCount />
        </Deep>
      </DraftProvider>,
    );

    expect(screen.getByLabelText("Draft"), "the stored draft is what you start from").toHaveValue(
      "Hello",
    );
    expect(screen.getByRole("status")).toHaveTextContent("5 characters");
    expect(store.load, "and the store was read once").toHaveBeenCalledTimes(1);
    expect(
      store.save,
      "nothing has been edited, so there is nothing to write back. An effect " +
        "with no guard saves the draft it has just loaded, every time the app " +
        "opens (README ex6)",
    ).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Draft"), "!");
    expect(screen.getByRole("status")).toHaveTextContent("6 characters");
    expect(store.save, "an edit is written back").toHaveBeenLastCalledWith("Hello!");

    rerender(
      <DraftProvider store={store} label="Memo">
        <Deep>
          <DraftEditor />
        </Deep>
        <Deep>
          <DraftCount />
        </Deep>
      </DraftProvider>,
    );
    expect(screen.queryByText("Memo"), "an unrelated prop changed").not.toBeNull();
    expect(
      store.load,
      "which is not a reason to read the store again - useReducer takes an " +
        "initialiser precisely so this happens once",
    ).toHaveBeenCalledTimes(1);
    expect(store.save, "nor to write it again").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex7 - HistoryBar knows when there is nothing to undo", async () => {
    const user = userEvent.setup();
    render(
      <NotesProvider>
        <Deep>
          <NotesEditor />
        </Deep>
        <Deep>
          <HistoryBar />
        </Deep>
      </NotesProvider>,
    );

    const add = async (note: string) => {
      await user.clear(screen.getByLabelText("New note"));
      await user.type(screen.getByLabelText("New note"), note);
      await user.click(screen.getByRole("button", { name: "Add" }));
    };

    expect(
      screen.getByRole("button", { name: "Undo" }),
      "an empty history has nothing to undo, and offering a button that does " +
        "nothing is worse than not offering it (README ex7)",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    await add("Buy beans");
    await add("Grind beans");
    await add("Brew");
    expect(texts("listitem")).toEqual(["Buy beans", "Grind beans", "Brew"]);
    expect(screen.getByRole("button", { name: "Undo" }), "now there is").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(texts("listitem"), "two steps back").toEqual(["Buy beans"]);
    expect(screen.getByRole("button", { name: "Redo" }), "and two steps forward again").toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(texts("listitem")).toEqual(["Buy beans", "Grind beans"]);

    await add("Pour");
    expect(texts("listitem"), "a new note goes on the end").toEqual([
      "Buy beans",
      "Grind beans",
      "Pour",
    ]);
    expect(
      screen.getByRole("button", { name: "Redo" }),
      "and the branch that used to be ahead is gone, so redo has nowhere to go",
    ).toBeDisabled();
  }, 30000);

  test("ex8 - the basket adds up, and the Add buttons never redraw", async () => {
    const user = userEvent.setup();
    const onAddRender = vi.fn();
    const beans = { id: "beans", name: "Beans", price: 750 };
    const mug = { id: "mug", name: "Mug", price: 500 };

    render(
      <BasketProvider>
        <Deep>
          <AddToBasket product={beans} onRender={onAddRender} />
          <AddToBasket product={mug} onRender={onAddRender} />
        </Deep>
        <Deep>
          <BasketLines />
          <BasketTotal />
        </Deep>
      </BasketProvider>,
    );

    expect(screen.getByRole("status"), "an empty basket is worth nothing").toHaveTextContent(
      "Total: 0",
    );
    expect(onAddRender, "two Add buttons, one render each").toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Add Beans" }));
    await user.click(screen.getByRole("button", { name: "Add Beans" }));
    expect(
      screen.queryByText("Beans x2"),
      "the same product twice is a quantity, not two lines",
    ).not.toBeNull();
    expect(screen.queryAllByRole("listitem").length, "so there is one line").toBe(1);
    expect(screen.getByRole("status"), "and the total is worked out, not stored").toHaveTextContent(
      "Total: 1500",
    );

    await user.click(screen.getByRole("button", { name: "Add Mug" }));
    expect(screen.queryByText("Mug x1"), "a different product is a new line").not.toBeNull();
    expect(screen.queryAllByRole("listitem").length).toBe(2);
    expect(screen.getByRole("status")).toHaveTextContent("Total: 2000");

    expect(
      onAddRender,
      "and after four clicks the Add buttons have still rendered once each. " +
        "They only ever needed to dispatch, so they must not be subscribed to " +
        "the basket - which means the dispatch has to live in a context of its " +
        "own, and be the same function every time (README ex8)",
    ).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Fewer Beans" }));
    expect(screen.queryByText("Beans x1"), "fewer is one fewer").not.toBeNull();
    expect(screen.queryAllByRole("listitem").length, "still two lines").toBe(2);

    await user.click(screen.getByRole("button", { name: "Fewer Beans" }));
    expect(
      screen.queryByRole("button", { name: "Fewer Beans" }),
      "and the last one takes the line with it",
    ).toBeNull();
    expect(screen.queryAllByRole("listitem").length).toBe(1);
    expect(screen.getByRole("status")).toHaveTextContent("Total: 500");
    expect(onAddRender, "still two").toHaveBeenCalledTimes(2);
  }, 30000);
});
