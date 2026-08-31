// d14_refs_dom / ex8 - reference solution.
import { useEffect, useRef, useState } from "react";

export function PlaylistRows({ songs }: { songs: string[] }) {
  const [items, setItems] = useState(songs);
  const buttons = useRef(new Map<string, HTMLButtonElement | null>());
  const heading = useRef<HTMLHeadingElement>(null);
  // What to focus once the removal has been committed. `undefined` means
  // "nothing to do", `null` means "the heading, there are no rows left".
  const pending = useRef<string | null | undefined>(undefined);

  function remove(song: string) {
    const index = items.indexOf(song);
    // Decided here, while the old list still exists and the neighbours are
    // still knowable.
    pending.current = items[index + 1] ?? items[index - 1] ?? null;
    setItems((current) => current.filter((entry) => entry !== song));
  }

  // Runs after the commit that removed the row, which is the first moment the
  // replacement node exists to be focused.
  useEffect(() => {
    const target = pending.current;
    if (target === undefined) return;
    pending.current = undefined;
    if (target === null) {
      heading.current?.focus();
    } else {
      buttons.current.get(target)?.focus();
    }
  }, [items]);

  return (
    <>
      <h2 tabIndex={-1} ref={heading}>
        Playlist
      </h2>
      {items.length === 0 ? (
        <p role="status">No tracks left</p>
      ) : (
        <ul>
          {items.map((song) => (
            <li key={song}>
              {song}
              <button
                type="button"
                ref={(node) => {
                  buttons.current.set(song, node);
                }}
                onClick={() => remove(song)}
              >
                Remove {song}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
