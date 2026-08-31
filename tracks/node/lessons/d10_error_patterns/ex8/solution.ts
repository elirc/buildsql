// d10_error_patterns / ex8 - the last place a failure can go.
// See lessons/d10_error_patterns/README.md, "Problem 8".

export type Category = "operational" | "fatal";

export interface BoundaryOptions {
  classify: (error: Error) => Category;
  onOperational: (error: Error) => void;
  onFatal: (error: Error) => void;
}

export interface ErrorBoundary {
  /** Anything at all may be handed to this. */
  handle(thrown: unknown): void;
}

/**
 * Normalise, classify, route. If `classify` throws, treat the ORIGINAL error as
 * fatal. If `onOperational` throws, that failure is itself fatal. If `onFatal`
 * throws, it escapes - there is nobody left to tell.
 */
export function createErrorBoundary(options: BoundaryOptions): ErrorBoundary {
  throw new Error("ex8: createErrorBoundary() is not implemented yet - edit this file.");
}
