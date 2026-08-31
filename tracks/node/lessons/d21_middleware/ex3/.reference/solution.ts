// d21_middleware / ex3 - reference solution (author only, used by `dojo verify`).
import { type NextFunction, type RequestHandler } from "express";

export function compose(...middlewares: RequestHandler[]): RequestHandler {
  return (req, res, next) => {
    const step = (index: number): void => {
      const middleware = middlewares[index];
      // Ran out: the composition as a whole is done, so carry on outside it.
      if (middleware === undefined) {
        next();
        return;
      }

      const advance: NextFunction = (error?: unknown) => {
        // Anything passed to next - an Error, or the string "route" - belongs
        // to the OUTER next, not to the next middleware in this stack.
        if (error !== undefined && error !== null) {
          next(error);
          return;
        }
        step(index + 1);
      };

      middleware(req, res, advance);
    };

    step(0);
  };
}
