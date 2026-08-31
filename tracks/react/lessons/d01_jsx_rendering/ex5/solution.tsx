// d01_jsx_rendering / ex5 - shorten it, but only when it is actually too long.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 5".

export function Excerpt({ text, limit }: { text: string; limit: number }) {
  return <p>{text}</p>;
}
