// d07_conditional_ui / ex3 - reference solution.

export function MaintenanceBanner({ notice }: { notice: string | null }) {
  if (notice === null) {
    return null;
  }

  return <p role="status">{notice}</p>;
}
