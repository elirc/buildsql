// d14_refs_dom / ex8 - removing the focused node drops focus on the floor.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 8".
import { useRef, useState } from "react";

export function PlaylistRows({ songs }: { songs: string[] }) {
  const [items, setItems] = useState(songs);
  const buttons = useRef(new Map<string, HTMLButtonElement | null>());
  const heading = useRef<HTMLHeadingElement>(null);

  function remove(song: string) {
    setItems((current) => current.filter((entry) => entry !== song));
  }

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
