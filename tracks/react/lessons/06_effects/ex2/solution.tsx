// 06_effects / ex2 - the dependency array is a claim about what changed.
// See tracks/react/lessons/06_effects/README.md, "Exercise 2".
import { useEffect } from "react";

export function ThemeSync({
  theme,
  onSync,
  label,
}: {
  theme: string;
  onSync: (theme: string) => void;
  label: string;
}) {
  useEffect(() => {
    onSync(theme);
  });

  return <p>{label}</p>;
}
