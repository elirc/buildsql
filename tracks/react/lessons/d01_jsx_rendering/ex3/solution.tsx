// d01_jsx_rendering / ex3 - two siblings, no wrapper, one machine-readable date.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 3".

export function Byline({
  author,
  isoDate,
  human,
}: {
  author: string;
  isoDate: string;
  human: string;
}) {
  return (
    <span>
      By {author} <span>{human}</span>
    </span>
  );
}
