// d07_discriminated_unions / ex3 - reference solution (author only).

export type Load =
  | { status: "idle" }
  | { status: "loading"; startedAt: number }
  | { status: "done"; body: string }
  | { status: "failed"; error: string; retriable: boolean };

export function renderLoad(load: Load): string {
  switch (load.status) {
    case "idle":
      return "idle";
    case "loading":
      return `loading since ${load.startedAt}`;
    case "done":
      return `done: ${load.body}`;
    case "failed":
      return `failed: ${load.error} (${load.retriable ? "retry" : "give up"})`;
  }
}
