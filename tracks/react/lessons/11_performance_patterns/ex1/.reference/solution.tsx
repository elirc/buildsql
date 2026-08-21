// 11_performance_patterns / ex1 - reference solution.
import { memo } from "react";

export const ExpensiveRow = memo(function ExpensiveRow({
  label,
  onRender,
}: {
  label: string;
  onRender: () => void;
}) {
  onRender();
  return <li>{label}</li>;
});
