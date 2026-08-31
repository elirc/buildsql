// d01_jsx_rendering / ex3 - reference solution.

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
    <>
      <span>By {author}</span>
      <time dateTime={isoDate}>{human}</time>
    </>
  );
}
