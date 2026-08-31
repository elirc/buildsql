// d05_events_updates / ex3 - reference solution.

export function LinkGuard({ href, onNavigate }: { href: string; onNavigate: (to: string) => void }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
    >
      Settings
    </a>
  );
}
