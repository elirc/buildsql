// 07_streams_2 / challenge - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StringDecoder } from "node:string_decoder";
import type { Readable, Writable } from "node:stream";

export interface CsvStats {
  read: number;
  written: number;
}

function createLineSplitter(): Transform {
  const decoder = new StringDecoder("utf8");
  let pending = "";

  return new Transform({
    readableObjectMode: true,
    transform(chunk: Buffer, _encoding, callback) {
      pending += decoder.write(chunk);
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) this.push(line);
      callback();
    },
    flush(callback) {
      pending += decoder.end();
      if (pending.length > 0) this.push(pending);
      callback();
    },
  });
}

export async function processCsv(
  source: Readable,
  sink: Writable,
  options: { minAmount: number },
): Promise<CsvStats> {
  const stats: CsvStats = { read: 0, written: 0 };
  let headerSeen = false;

  const toJsonLines = new Transform({
    writableObjectMode: true,
    transform(line: string, _encoding, callback) {
      const text = line.trim();
      if (text === "") {
        callback();
        return;
      }
      if (!headerSeen) {
        headerSeen = true;
        callback();
        return;
      }

      stats.read += 1;
      const [id, rawAmount] = text.split(",");
      const amount = Number(rawAmount);
      if (amount >= options.minAmount) {
        stats.written += 1;
        callback(null, `${JSON.stringify({ id, amount })}\n`);
        return;
      }
      callback();
    },
  });

  await pipeline(source, createLineSplitter(), toJsonLines, sink);
  return stats;
}
