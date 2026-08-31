// d01_annotations_inference / ex5 - annotate the object you return.
// See lessons/d01_annotations_inference/README.md, "ex5".
//
// Note the missing return type. A body that only throws infers `never`, which
// satisfies every annotation - writing the object type down is half the work.

export function summarise(values: readonly number[]) {
  throw new Error("ex5: summarise() is not implemented yet - edit this file.");
}
