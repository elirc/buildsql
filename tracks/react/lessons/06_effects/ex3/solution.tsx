// 06_effects / ex3 - a subscription, and the cleanup that ends it.
// See tracks/react/lessons/06_effects/README.md, "Exercise 3".

export function EscapeToClose({ onClose }: { onClose: () => void }) {
  return <p>Press Escape to close</p>;
}
