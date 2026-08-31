// Gate for node/d11_custom_errors. Quoted verbatim in README.md.
//
// Error classes are ordinary classes, so this whole gate is synchronous: build
// one, look at it, catch it, serialise it. What is being checked throughout is
// that the things a subclass is supposed to inherit - instanceof, the stack,
// the name that ends up in a log - actually survived.
import { describe, expect, test } from "vitest";

import { NotFoundError } from "./ex1/solution";
import { BadRequestError, ConflictError, HttpError } from "./ex2/solution";
import { serialiseError } from "./ex3/solution";
import { reviveError } from "./ex4/solution";
import { RetryableError } from "./ex5/solution";
import { BatchError } from "./ex6/solution";
import { ErrorLike, isErrorOfType } from "./ex7/solution";
import { ValidationFailed, validate, type Issue } from "./ex8/solution";

describe("d11_custom_errors", () => {
  test("ex1 - NotFoundError is an Error, and says so", () => {
    const error = new NotFoundError("invoice", "inv-42");

    expect(error, "a custom error IS an Error").toBeInstanceOf(Error);
    expect(
      error,
      "and it is also its own class, which is what lets a catch block tell one " +
        "failure from another without reading the message",
    ).toBeInstanceOf(NotFoundError);

    expect(
      error.name,
      "name must be set in the constructor. Without it the inherited value is " +
        "Error, and every log line about this failure says Error",
    ).toBe("NotFoundError");
    expect(
      error.message,
      "the message is built from the two pieces: <resource> not found: <id>",
    ).toBe("invoice not found: inv-42");
    expect(error.resource, "the resource, kept as data").toBe("invoice");
    expect(error.id, "and the id, so a handler never has to parse the message").toBe(
      "inv-42",
    );
    expect(error.status, "a missing thing maps to HTTP 404").toBe(404);

    expect(
      typeof error.stack,
      "extending Error keeps the stack trace - this is the whole reason you " +
        "subclass Error rather than throwing an object literal",
    ).toBe("string");
    expect(
      error.stack?.includes("NotFoundError"),
      "and the stack names the class, because the name was set before anybody " +
        "read it",
    ).toBe(true);

    let caught: unknown;
    try {
      throw error;
    } catch (thrown) {
      caught = thrown;
    }
    expect(caught instanceof NotFoundError, "and it survives a throw and a catch").toBe(
      true,
    );
  });

  test("ex2 - the HttpError family narrows in two directions", () => {
    const bad = new BadRequestError("email is required");

    expect(bad, "a leaf of the hierarchy is still an Error").toBeInstanceOf(Error);
    expect(
      bad,
      "and still an HttpError - which is what lets one middleware catch the " +
        "whole family",
    ).toBeInstanceOf(HttpError);
    expect(bad.name, "while naming itself precisely").toBe("BadRequestError");
    expect(bad.status, "400").toBe(400);
    expect(
      bad.expose,
      "a 4xx is the caller fault, so the message is safe to send back",
    ).toBe(true);

    const conflict = new ConflictError("slug already taken");
    expect(conflict.status, "409").toBe(409);
    expect(conflict.name, "and its own name").toBe("ConflictError");
    expect(
      conflict,
      "siblings are not each other: this is the narrowing that a shared status " +
        "number cannot give you",
    ).not.toBeInstanceOf(BadRequestError);

    const server = new HttpError(503, "postgres is refusing connections");
    expect(server.name, "the base class names itself too").toBe("HttpError");
    expect(
      server.expose,
      "a 5xx is your fault, and its message is an internal detail - exposing " +
        "it is how connection strings end up in a browser console",
    ).toBe(false);

    const original = new Error("ECONNREFUSED 127.0.0.1:5432");
    const wrapped = new HttpError(502, "bad gateway", { cause: original });
    expect(
      wrapped.cause,
      "and the cause option has to reach Error, or the chain stops at your " +
        "subclass",
    ).toBe(original);
  });

  test("ex3 - serialiseError() produces something you can put in a log line", () => {
    const root = Object.assign(new Error("ECONNREFUSED"), { code: "ECONNREFUSED" });
    const outer = Object.assign(new Error("query failed"), { status: 503, cause: root });

    expect(
      serialiseError(outer),
      "name and message always; code and status when they are there; and the " +
        "cause serialised the same way, all the way down",
    ).toEqual({
      name: "Error",
      message: "query failed",
      status: 503,
      cause: { name: "Error", message: "ECONNREFUSED", code: "ECONNREFUSED" },
    });

    expect(
      JSON.stringify(serialiseError(outer)).includes("stack"),
      "the stack is deliberately left out: it is enormous, it is not JSON " +
        "friendly, and it leaks absolute paths from your build machine",
    ).toBe(false);

    const plain = serialiseError(new Error("plain"));
    expect(
      Object.keys(plain).sort(),
      "keys that have no value are omitted rather than set to undefined - a " +
        "log line full of nulls is a log line nobody reads",
    ).toEqual(["message", "name"]);

    const withData = serialiseError(new Error("bad row", { cause: { row: 3 } }));
    expect(
      Object.keys(withData).sort(),
      "a cause that is not an Error is not another link, so there is nothing " +
        "to recurse into",
    ).toEqual(["message", "name"]);

    const first = new Error("first");
    const second = new Error("second", { cause: first });
    (first as Error & { cause?: unknown }).cause = second;
    expect(
      serialiseError(second),
      "and a chain that loops must terminate: serialising is often the last " +
        "thing a dying process does, and a hang there loses the report entirely",
    ).toEqual({
      name: "Error",
      message: "second",
      cause: { name: "Error", message: "first" },
    });
  });

  test("ex4 - reviveError() rebuilds the class when it can and an Error when it cannot", () => {
    class TimeoutError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "TimeoutError";
      }
    }

    const revived = reviveError(
      {
        name: "TimeoutError",
        message: "took too long",
        code: "ETIMEDOUT",
        cause: { name: "Error", message: "socket hang up" },
      },
      { TimeoutError },
    );

    expect(
      revived,
      "a name the registry knows becomes a real instance of that class, so " +
        "instanceof works again on the far side of the wire",
    ).toBeInstanceOf(TimeoutError);
    expect(revived.message, "with its message").toBe("took too long");
    expect(
      (revived as Error & { code?: string }).code,
      "and the extra fields put back on it",
    ).toBe("ETIMEDOUT");
    expect(
      revived.cause,
      "the cause is revived too, recursively",
    ).toBeInstanceOf(Error);
    expect((revived.cause as Error).message).toBe("socket hang up");

    const unknown = reviveError({ name: "SomethingElse", message: "who knows" }, {
      TimeoutError,
    });
    expect(
      unknown,
      "a name nobody registered still has to produce something throwable",
    ).toBeInstanceOf(Error);
    expect(
      unknown,
      "just not a class it is not",
    ).not.toBeInstanceOf(TimeoutError);
    expect(
      unknown.name,
      "and the original name is kept anyway, because it is the only clue left " +
        "about what actually failed",
    ).toBe("SomethingElse");
  });

  test("ex5 - RetryableError carries its own type guard", () => {
    const error = new RetryableError("upstream returned 503", "EUPSTREAM");

    expect(error, "an Error").toBeInstanceOf(Error);
    expect(error.name, "named after itself").toBe("RetryableError");
    expect(error.code, "with the code kept as data").toBe("EUPSTREAM");

    expect(RetryableError.is(error), "the guard recognises an instance").toBe(true);
    expect(
      RetryableError.is(new Error("something else")),
      "and refuses anything else - which is what a retry loop asks before " +
        "trying again",
    ).toBe(false);
    expect(RetryableError.is("a string"), "including things that are not errors").toBe(
      false,
    );
    expect(RetryableError.is(null), "and null").toBe(false);

    const original = new Error("ECONNRESET");
    const wrapped = RetryableError.wrap(original, "ENETWORK");
    expect(wrapped, "wrap() produces one of these").toBeInstanceOf(RetryableError);
    expect(wrapped.message, "keeping the original message").toBe("ECONNRESET");
    expect(wrapped.code, "with the code you asked for").toBe("ENETWORK");
    expect(
      wrapped.cause,
      "and the original underneath, so nothing is lost",
    ).toBe(original);

    expect(
      RetryableError.wrap(wrapped, "ESOMETHINGELSE"),
      "wrapping something already retryable returns it unchanged. Without that " +
        "a retry loop builds a cause chain one link deeper on every attempt",
    ).toBe(wrapped);

    const fromString = RetryableError.wrap("just a string", "EODD");
    expect(fromString.message, "anything at all can be wrapped").toBe("just a string");
    expect(fromString.code).toBe("EODD");
  });

  test("ex6 - BatchError extends the aggregate the platform already has", () => {
    const failures = [
      Object.assign(new Error("a.png"), { code: "E_TOO_BIG" }),
      Object.assign(new Error("b.png"), { code: "E_BAD_TYPE" }),
      new Error("c.png"),
      Object.assign(new Error("d.png"), { code: "E_TOO_BIG" }),
    ];
    const batch = new BatchError("uploading avatars", failures);

    expect(
      batch,
      "AggregateError already exists and already holds a list of errors - " +
        "reinventing it means every tool that knows about it stops working",
    ).toBeInstanceOf(AggregateError);
    expect(batch, "and it is an Error like everything else").toBeInstanceOf(Error);
    expect(batch.name, "named after itself").toBe("BatchError");
    expect(batch.operation, "with the operation kept as data").toBe("uploading avatars");
    expect(
      batch.message,
      "and a message that summarises rather than concatenating four messages " +
        "into an unreadable line",
    ).toBe("uploading avatars: 4 failed");

    expect(batch.errors, "the errors are all there").toHaveLength(4);
    failures.push(new Error("e.png"));
    expect(
      batch.errors,
      "and they were copied, not borrowed: an error that changes after it was " +
        "reported is a debugging session nobody enjoys",
    ).toHaveLength(4);

    expect(
      batch.codes(),
      "codes() reports the distinct codes, sorted, ignoring the errors that " +
        "have none - that is the line you actually put in an alert",
    ).toEqual(["E_BAD_TYPE", "E_TOO_BIG"]);

    const empty = new BatchError("nothing at all", []);
    expect(empty.message, "an empty batch still reads correctly").toBe(
      "nothing at all: 0 failed",
    );
    expect(empty.codes(), "with no codes").toEqual([]);
  });

  test("ex7 - identity without instanceof, for the times instanceof lies", () => {
    class NotFound extends Error {
      constructor() {
        super("gone");
        this.name = "NotFoundError";
      }
    }

    expect(
      isErrorOfType(new NotFound(), "NotFoundError"),
      "the ordinary case: a real error whose name matches",
    ).toBe(true);
    expect(
      isErrorOfType({ name: "NotFoundError", message: "gone" }, "NotFoundError"),
      "and the case instanceof cannot handle: an error-shaped object from " +
        "another realm - a worker, a vm context, a JSON response - where the " +
        "Error constructor is a different function entirely",
    ).toBe(true);

    expect(
      isErrorOfType(new Error("gone"), "NotFoundError"),
      "a different name is a different type",
    ).toBe(false);
    expect(
      isErrorOfType({ name: "NotFoundError" }, "NotFoundError"),
      "and a name alone is not enough: an error has a message too, and " +
        "matching on one field makes every config object with a name field an " +
        "error",
    ).toBe(false);
    expect(isErrorOfType(null, "NotFoundError"), "null is not an error").toBe(false);
    expect(isErrorOfType("NotFoundError", "NotFoundError"), "nor is a string").toBe(false);

    expect(
      new Error("real") instanceof ErrorLike,
      "Symbol.hasInstance lets a class decide for itself what instanceof means",
    ).toBe(true);
    expect(
      ({ name: "Error", message: "shaped like one" } as unknown) instanceof ErrorLike,
      "so a structurally compatible object can pass instanceof without ever " +
        "having been constructed by it",
    ).toBe(true);
    expect(
      ({ name: "Error" } as unknown) instanceof ErrorLike,
      "the same two-field rule applies",
    ).toBe(false);
    expect(("nope" as unknown) instanceof ErrorLike, "a string is not").toBe(false);
    expect((null as unknown) instanceof ErrorLike, "and neither is null").toBe(false);
  });

  test("ex8 - validate() reports every problem at once", () => {
    const required = (value: unknown, path: string): Issue | null =>
      value === undefined || value === ""
        ? { path, code: "required", message: `${path} is required` }
        : null;
    const isEmail = (value: unknown, path: string): Issue | null =>
      typeof value === "string" && value.includes("@")
        ? null
        : { path, code: "email", message: `${path} must contain an @` };

    const rules = { name: [required], email: [required, isEmail] };

    expect(
      () => validate({ name: "Ada", email: "ada@example.com" }, rules),
      "valid input passes quietly",
    ).not.toThrow();

    let failure: ValidationFailed | undefined;
    try {
      validate({ name: "", email: undefined }, rules);
    } catch (error) {
      failure = error as ValidationFailed;
    }

    expect(failure, "invalid input throws").toBeInstanceOf(ValidationFailed);
    expect(failure, "which is an Error").toBeInstanceOf(Error);
    expect(failure?.name, "named after itself").toBe("ValidationFailed");

    expect(
      failure?.issues.map((issue) => `${issue.path}:${issue.code}`),
      "EVERY rule runs on every field, in field order then rule order. " +
        "Stopping at the first failure makes a user fix one field, resubmit, " +
        "and be told about the next one",
    ).toEqual(["name:required", "email:required", "email:email"]);

    expect(
      failure?.message,
      "the message counts them; the detail lives in issues, where a client can " +
        "use it",
    ).toBe("validation failed (3 issues)");

    expect(
      JSON.parse(JSON.stringify(failure)),
      "and toJSON() decides what crosses the wire: the issues, and no stack. " +
        "An Error with no toJSON serialises to {} and takes the whole report " +
        "with it",
    ).toEqual({
      name: "ValidationFailed",
      message: "validation failed (3 issues)",
      issues: [
        { path: "name", code: "required", message: "name is required" },
        { path: "email", code: "required", message: "email is required" },
        { path: "email", code: "email", message: "email must contain an @" },
      ],
    });
  });
});
