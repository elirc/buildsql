// d01_jsx_rendering / ex7 - reference solution.

export function StarRating({ rating, max }: { rating: number; max: number }) {
  const glyphs = "*".repeat(rating) + ".".repeat(max - rating);

  return (
    <span role="img" aria-label={`${rating} out of ${max} stars`}>
      <span aria-hidden="true">{glyphs}</span>
    </span>
  );
}
