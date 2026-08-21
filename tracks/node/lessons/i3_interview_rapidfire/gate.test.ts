// Gate for node/i3_interview_rapidfire. Quoted verbatim in README.md.
//
// Short questions on the concepts that come up most often, in fresh form.
// Every exercise here is review-marked in spirit: the point is to be able to
// produce these answers again in three weeks without looking.
import { Writable } from "node:stream";
import { describe, expect, test, vi } from "vitest";

import { predictOrder } from "./ex1/solution";
import { run as runSnippet } from "./ex1/snippet";
import { pumpAll } from "./ex2/solution";
import { withDeadline } from "./ex3/solution";
import { toResponse } from "./ex4/solution";
import { predictOrder as predictReview } from "./review1/solution";
import { run as runReviewSnippet } from "./review1/snippet";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function record(schedule: (log: (label: string) => void) => void): Promise<string[]> {
  const seen: string[] = [];
  let failure: unknown;
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      try {
        schedule((label) => seen.push(label));
      } catch (error) {
        failure = error;
      }
      resolve();
    }, 0);
  });
  await settle();
  await settle();
  await settle();
  if (failure) throw failure;
  return seen;
}

function divergence(prediction: readonly string[], actual: readonly string[]): string {
  if (!Array.isArray(prediction)) return "predictOrder() did not return an array";
  if (prediction.length !== actual.length) {
    return `you predicted ${prediction.length} line(s); ${actual.length} actually ran`;
  }
  const index = actual.findIndex((label, i) => prediction[i] !== label);
  if (index === -1) return "";
  return (
    `the first ${index} line(s) are right, then position ${index} diverges ` +
    `(you predicted "${prediction[index]}", which is not what ran there)`
  );
}

describe("i3_interview_rapidfire", () => {
  test("ex1 - five labels, thirty seconds", async () => {
    const actual = await record(runSnippet);
    expect(actual.length, "sanity check on the gate: five labels").toBe(5);
    expect(
      divergence(predictOrder(), actual),
      "an async function body runs synchronously to its first await; the " +
        "nextTick queue is served before the microtask queue; and the " +
        "continuation was queued before the queueMicrotask below it",
    ).toBe("");
  });

  test("ex2 - pumpAll() honours the one boolean everybody ignores", async () => {
    const received: Buffer[] = [];
    let maxBuffered = 0;

    const sink: Writable = new Writable({
      highWaterMark: 16,
      write(chunk: Buffer, _encoding, callback) {
        received.push(Buffer.from(chunk));
        maxBuffered = Math.max(maxBuffered, sink.writableLength);
        setImmediate(callback);
      },
    });

    async function* source(): AsyncGenerator<string> {
      for (let i = 0; i < 20; i += 1) yield String(i % 10).repeat(8);
    }

    const written = await pumpAll(source(), sink);
    await new Promise<void>((resolve) => sink.end(() => resolve()));

    expect(written, "one count per chunk written").toBe(20);
    expect(
      Buffer.concat(received).toString(),
      "every chunk arrives, in order",
    ).toBe(
      Array.from({ length: 20 }, (_unused, i) => String(i % 10).repeat(8)).join(""),
    );
    expect(
      maxBuffered,
      "write() returning false means stop until drain. Ignore it and the " +
        "stream buffers everything in memory - the number here would be ten " +
        "times the highWaterMark",
    ).toBeLessThanOrEqual(16);
  });

  test("ex3 - withDeadline() races, and cleans up after itself", async () => {
    vi.useFakeTimers();
    try {
      await expect(
        withDeadline(Promise.resolve("fast"), 5000, "the database took too long"),
        "the work won the race, so its value comes through",
      ).resolves.toBe("fast");
      expect(
        vi.getTimerCount(),
        "and the timer is gone - an uncleared timer keeps the process alive " +
          "long after the work is done",
      ).toBe(0);

      let resolveSlow: ((value: string) => void) | undefined;
      const slow = new Promise<string>((resolve) => {
        resolveSlow = resolve;
      });
      const timed = withDeadline(slow, 5000, "the database took too long");
      const outcome = timed.then(
        () => undefined,
        (error: unknown) => error as Error & { code?: string },
      );

      await vi.advanceTimersByTimeAsync(5000);
      const error = await outcome;
      expect(error?.message, "the message is the one the caller gave").toBe(
        "the database took too long",
      );
      expect(
        error?.code,
        'tag it with code "ETIMEDOUT" so a caller can branch on the kind of ' +
          "failure rather than on the text",
      ).toBe("ETIMEDOUT");
      resolveSlow?.("too late");
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex4 - toResponse() turns any thrown thing into an honest reply", () => {
    const known = Object.assign(new Error("no such order"), {
      status: 404,
      code: "not_found",
    });
    expect(
      toResponse(known),
      "an error you built deliberately already carries its status and code, " +
        "and its message is safe to show",
    ).toEqual({
      status: 404,
      body: { error: "not_found", message: "no such order" },
    });

    const system = Object.assign(new Error("connect ECONNREFUSED 10.0.0.7:5432"), {
      code: "ECONNREFUSED",
    });
    expect(
      toResponse(system),
      "a system error means a dependency failed: 502, and a generic message - " +
        "the real one names an internal host and port",
    ).toEqual({
      status: 502,
      body: { error: "upstream_error", message: "upstream request failed" },
    });

    expect(
      toResponse(new TypeError("cannot read properties of undefined")),
      "a programmer error is a 500, and the client is told nothing useful to " +
        "an attacker",
    ).toEqual({
      status: 500,
      body: { error: "internal_error", message: "internal server error" },
    });

    expect(
      toResponse("something went wrong"),
      "a thrown string is not an Error at all - same treatment",
    ).toEqual({
      status: 500,
      body: { error: "internal_error", message: "internal server error" },
    });
  });

  test("review1 - seven labels, and a chained then", async () => {
    const actual = await record(runReviewSnippet);
    expect(actual.length, "sanity check on the gate: seven labels").toBe(7);
    expect(
      divergence(predictReview(), actual),
      "a chained .then is queued when the previous one settles, so it joins " +
        "the back of the drain in progress - and a nextTick queued by a timer " +
        "callback runs before the loop moves on",
    ).toBe("");
  });
});
