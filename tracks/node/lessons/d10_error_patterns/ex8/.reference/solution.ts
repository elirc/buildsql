// d10_error_patterns / ex8 - reference solution (author only, used by `dojo verify`).

export type Category = "operational" | "fatal";

export interface BoundaryOptions {
  classify: (error: Error) => Category;
  onOperational: (error: Error) => void;
  onFatal: (error: Error) => void;
}

export interface ErrorBoundary {
  handle(thrown: unknown): void;
}

function asError(thrown: unknown): Error {
  return thrown instanceof Error ? thrown : new Error(String(thrown), { cause: thrown });
}

export function createErrorBoundary(options: BoundaryOptions): ErrorBoundary {
  return {
    handle(thrown: unknown): void {
      const error = asError(thrown);

      let category: Category;
      try {
        category = options.classify(error);
      } catch {
        // Cannot tell what it is - assume the worst, and report the error that
        // somebody actually has to fix rather than the classifier's complaint.
        options.onFatal(error);
        return;
      }

      if (category === "fatal") {
        // Deliberately unguarded: if the last handler fails there is nowhere
        // left to send it, and swallowing it here would lose both errors.
        options.onFatal(error);
        return;
      }

      try {
        options.onOperational(error);
      } catch (handlerFailure) {
        options.onFatal(asError(handlerFailure));
      }
    },
  };
}
