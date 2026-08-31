// d06_lists_keys / ex5 - reference solution.
import { Fragment } from "react";

export function Glossary({
  entries,
}: {
  entries: { id: string; term: string; definition: string }[];
}) {
  return (
    <dl>
      {entries.map((entry) => (
        <Fragment key={entry.id}>
          <dt>{entry.term}</dt>
          <dd>{entry.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
