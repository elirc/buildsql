// 06_effects / ex2 - reference solution.
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
  }, [theme, onSync]);

  return <p>{label}</p>;
}
