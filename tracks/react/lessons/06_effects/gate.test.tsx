// Gate for react/06_effects. Quoted verbatim in README.md.
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PageTitle } from "./ex1/solution";
import { ThemeSync } from "./ex2/solution";
import { EscapeToClose } from "./ex3/solution";
import { UserBadge } from "./ex4/solution";
import { Stopwatch } from "./challenge/solution";
import { AnnounceOnChange } from "./review1/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("06_effects", () => {
  test("ex1 - PageTitle sets the document title and puts it back", () => {
    document.title = "Dojo";
    const { rerender, unmount } = render(<PageTitle title="Lesson 06" />);

    expect(
      document.title,
      "the effect has to write the title prop to document.title - reaching " +
        "outside React is exactly what an effect is for (README ex1)",
    ).toBe("Lesson 06");

    rerender(<PageTitle title="Effects" />);
    expect(
      document.title,
      "a new title prop must re-run the effect. An empty dependency array says " +
        "run once and never again, which is not what this component promises",
    ).toBe("Effects");

    unmount();
    expect(
      document.title,
      "on unmount the title must go back to what it was before this component " +
        "existed - that is the cleanup function's job",
    ).toBe("Dojo");
  });

  test("ex2 - ThemeSync tells the outside world only when the theme changes", () => {
    const onSync = vi.fn();
    const { rerender } = render(<ThemeSync theme="light" onSync={onSync} label="A" />);

    expect(onSync, "the effect runs once after the first render").toHaveBeenCalledTimes(1);
    expect(onSync, "and it reports the current theme").toHaveBeenLastCalledWith("light");

    rerender(<ThemeSync theme="light" onSync={onSync} label="B" />);
    expect(
      onSync,
      "the label changed, the theme did not, and this effect is about the " +
        "theme. An effect with no dependency array re-runs after every single " +
        "render - list what it actually depends on (README ex2)",
    ).toHaveBeenCalledTimes(1);

    rerender(<ThemeSync theme="dark" onSync={onSync} label="B" />);
    expect(onSync, "a real theme change must re-run it").toHaveBeenCalledTimes(2);
    expect(onSync, "with the new value").toHaveBeenLastCalledWith("dark");
  });

  test("ex3 - EscapeToClose stops listening once it is gone", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = render(<EscapeToClose onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(
      onClose,
      "pressing Escape anywhere on the page must call onClose - subscribe to " +
        "keydown on the document inside an effect",
    ).toHaveBeenCalledTimes(1);

    await user.keyboard("a");
    expect(onClose, "any other key is none of this component's business").toHaveBeenCalledTimes(1);

    unmount();
    await user.keyboard("{Escape}");
    expect(
      onClose,
      "an unmounted component that is still listening is a leak, and it will " +
        "eventually set state on something that no longer exists. Return a " +
        "cleanup function that removes the listener (README ex3)",
    ).toHaveBeenCalledTimes(1);
  }, 20000);

  test("ex4 - UserBadge fetches on mount and when the id changes", async () => {
    const fetchUser = vi.fn(async (id: string) => ({ name: id === "1" ? "Ada" : "Lin" }));
    const { rerender } = render(<UserBadge userId="1" fetchUser={fetchUser} />);

    expect(
      await screen.findByText("Ada"),
      "the effect calls fetchUser and shows the name once the promise settles",
    ).toBeInTheDocument();
    expect(fetchUser, "exactly one request so far").toHaveBeenCalledTimes(1);

    rerender(<UserBadge userId="1" fetchUser={fetchUser} />);
    expect(
      fetchUser,
      "re-rendering with the same id must not refetch - that is what the " +
        "dependency array is for, and getting it wrong here is an infinite loop " +
        "in production",
    ).toHaveBeenCalledTimes(1);

    rerender(<UserBadge userId="2" fetchUser={fetchUser} />);
    expect(await screen.findByText("Lin"), "a new id must fetch again").toBeInTheDocument();
    expect(fetchUser, "two ids, two requests").toHaveBeenCalledTimes(2);
  });

  test("challenge - Stopwatch counts real seconds, not the same second twice", () => {
    vi.useFakeTimers();
    render(<Stopwatch />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "after three seconds it should read 3. Reading 1 means every tick added " +
        "one to the same captured value: the interval callback was created " +
        "during one render and keeps that render's seconds forever. Use the " +
        "updater form (README challenge)",
    ).toHaveTextContent("3");

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "stopped means stopped - the interval has to be cleared",
    ).toHaveTextContent("3");

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status"), "starting again resumes from 3").toHaveTextContent("4");
  });

  test("review1 - AnnounceOnChange cleans up before it announces again", () => {
    const onAnnounce = vi.fn();
    const onClear = vi.fn();
    const { rerender, unmount } = render(
      <AnnounceOnChange message="Saved" onAnnounce={onAnnounce} onClear={onClear} />,
    );

    expect(onAnnounce, "announce the first message").toHaveBeenLastCalledWith("Saved");
    expect(onClear, "nothing to clear yet").not.toHaveBeenCalled();

    rerender(<AnnounceOnChange message="Deleted" onAnnounce={onAnnounce} onClear={onClear} />);
    expect(
      onClear,
      "React runs the previous cleanup before the next effect, and the cleanup " +
        "belongs to the render that created it - so it clears the OLD message",
    ).toHaveBeenLastCalledWith("Saved");
    expect(onAnnounce, "then announces the new one").toHaveBeenLastCalledWith("Deleted");

    unmount();
    expect(onClear, "and unmounting clears whatever was last announced").toHaveBeenLastCalledWith(
      "Deleted",
    );
  });
});
