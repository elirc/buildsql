// 01_components_jsx / ex4 - reference solution.

export function Notice({ tone, message }: { tone: "error" | "info"; message: string }) {
  const role = tone === "error" ? "alert" : "status";
  return (
    <p role={role} className={`notice notice-${tone}`}>
      {message}
    </p>
  );
}
