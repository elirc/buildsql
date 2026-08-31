// d01_annotations_inference / ex1 - reference solution (author only).

export function formatReading(station: string, celsius: number): string {
  return `${station} ${celsius.toFixed(1)}C`;
}
