// d01_jsx_rendering / ex7 - a picture made of characters still needs a name.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 7".

export function StarRating({ rating, max }: { rating: number; max: number }) {
  return <span>{"*".repeat(rating)}</span>;
}
