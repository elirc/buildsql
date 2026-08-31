// d05_events_updates / ex3 - a link the app wants to handle itself.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 3".

export function LinkGuard({ href, onNavigate }: { href: string; onNavigate: (to: string) => void }) {
  return (
    <a href={href} onClick={() => onNavigate(href)}>
      Settings
    </a>
  );
}
