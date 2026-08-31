// d02_components_props / ex5 - reference solution.

const LABELS: Record<string, string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
};

export function StatusPill({ status }: { status: string }) {
  const label = LABELS[status];
  if (label === undefined) {
    return null;
  }

  return <span role={status === "failed" ? "alert" : "status"}>{label}</span>;
}
