// i2_interview_drills / challenge - reference solution.
import { useEffect, useId, useState } from "react";

export function Typeahead({
  search,
  onSelect,
}: {
  search: (query: string) => Promise<string[]>;
  onSelect: (value: string) => void;
}) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const optionId = (index: number) => `${listId}-option-${index}`;
  const open = options.length > 0;

  useEffect(() => {
    if (query.trim() === "") {
      setOptions([]);
      setActiveIndex(-1);
      return;
    }

    let current = true;
    const timer = setTimeout(() => {
      search(query).then((found) => {
        if (current) {
          setOptions(found);
          setActiveIndex(-1);
        }
      });
    }, 300);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, search]);

  function select(value: string) {
    onSelect(value);
    setQuery(value);
    setOptions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < options.length) {
        event.preventDefault();
        select(options[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOptions([]);
      setActiveIndex(-1);
    }
  }

  return (
    <>
      <label htmlFor={inputId}>Search products</label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul id={listId} role="listbox">
          {options.map((option, index) => (
            <li
              key={option}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => select(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
