// d06_lists_keys / ex5 - two elements per entry, one key, no wrapper.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 5".

export function Glossary({
  entries,
}: {
  entries: { id: string; term: string; definition: string }[];
}) {
  return (
    <dl>
      {entries.map((entry) => (
        <div key={entry.id}>
          <dt>{entry.term}</dt>
          <dd>{entry.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
