// d06_lists_keys / ex6 - an array of names, read out as one sentence.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 6".

export function AuthorLine({ names }: { names: string[] }) {
  return <p>{names.join(", ")}</p>;
}
