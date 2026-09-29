import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PracticeView } from "./PracticeView";
import { newWorkspace } from "./storage";
import { putProject } from "./progression";
const props = () => ({
  workspace: newWorkspace(),
  busy: false,
  onChange: vi.fn(),
  onPending: vi.fn(),
});
describe("practice project interaction", () => {
  it("shows an empty list without inventing example projects", () => {
    render(<PracticeView {...props()} />);
    expect(screen.getByText(/No practice projects match/)).toBeInTheDocument();
  });
  it("retains the entered form when completion evidence is rejected", () => {
    const p = props();
    render(<PracticeView {...p} />);
    fireEvent.click(
      screen.getByRole("button", { name: "New practice project" }),
    );
    fireEvent.change(screen.getByLabelText("Project title"), {
      target: { value: "Contact book" },
    });
    fireEvent.change(screen.getByLabelText("Observable goal"), {
      target: {
        value:
          "Create and update validated contacts with recoverable rejected drafts.",
      },
    });
    fireEvent.change(screen.getByLabelText("Project status"), {
      target: { value: "complete" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply project to workspace draft" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Completion evidence/);
    expect(screen.getByLabelText("Project title")).toHaveValue("Contact book");
    expect(p.onChange).not.toHaveBeenCalled();
  });
  it("applies a valid project to the parent draft and closes only after validation", () => {
    const p = props();
    render(<PracticeView {...p} />);
    fireEvent.click(
      screen.getByRole("button", { name: "New practice project" }),
    );
    fireEvent.change(screen.getByLabelText("Project title"), {
      target: { value: "Issue tracker" },
    });
    fireEvent.change(screen.getByLabelText("Observable goal"), {
      target: {
        value:
          "Create, search and close issues while retaining rejected input.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply project to workspace draft" }),
    );
    expect(p.onChange).toHaveBeenCalledOnce();
    expect(p.onChange.mock.calls[0][0](p.workspace).projects[0].title).toBe(
      "Issue tracker",
    );
    expect(screen.queryByLabelText("Project title")).not.toBeInTheDocument();
  });
  it("filters actual projects by search and status", () => {
    const p = props();
    p.workspace = putProject(p.workspace, {
      id: crypto.randomUUID(),
      title: "Contact book",
      goal: "Create and update validated contacts in a local workspace.",
      evidence: "",
      status: "planned",
    });
    render(<PracticeView {...p} />);
    fireEvent.change(screen.getByLabelText("Search practice projects"), {
      target: { value: "missing" },
    });
    expect(screen.getByText(/No practice projects match/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search practice projects"), {
      target: { value: "contact" },
    });
    expect(
      screen.getByRole("heading", { name: "Contact book" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter project status"), {
      target: { value: "complete" },
    });
    expect(
      screen.queryByRole("heading", { name: "Contact book" }),
    ).not.toBeInTheDocument();
  });
});
