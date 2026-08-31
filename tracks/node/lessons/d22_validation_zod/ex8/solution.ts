// d22_validation_zod / ex8 - a schema that contains itself.
// See lessons/d22_validation_zod/README.md, "Problem 8".
import { type Express } from "express";
import { z } from "zod";

/** A category tree may be at most this many levels deep, root included. */
export const MAX_DEPTH = 3;

export interface Category {
  name: string;
  children: Category[];
}

/**
 * A category and its children, to any depth - with a `superRefine` that refuses
 * a tree deeper than `MAX_DEPTH` and names the node that went too far.
 *
 * As shipped this rejects everything - replace it with the real schema.
 */
export const categorySchema = z.custom<Category>(() => false, {
  message: "ex8: categorySchema is not implemented yet - edit this file.",
});

/** POST /categories - 201 with the depth, or 400 naming the offending node. */
export function createApp(): Express {
  throw new Error("ex8: createApp() is not implemented yet - edit this file.");
}
