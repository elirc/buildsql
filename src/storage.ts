import {
  MAX_BYTES,
  parseImport,
  validateWorkspace,
  type Workspace,
} from "./contracts";
import { freshSave } from "./progression";

export const DATABASE = "ipskill-workspace-v2";
export interface Backup {
  id: string;
  created: string;
  raw: string;
  reason: string;
}
export class ConflictError extends Error {
  constructor() {
    super(
      "Another tab saved or replaced this workspace. Your draft is retained. Export it before loading current data.",
    );
  }
}
export function openDatabase(
  factory: IDBFactory = indexedDB,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let failed = false;
    const request = factory.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("workspace");
      request.result.createObjectStore("backups", { keyPath: "id" });
    };
    request.onerror = () =>
      reject(request.error ?? Error("Cannot open browser storage."));
    request.onblocked = () => {
      failed = true;
      reject(Error("Close older IPSKILL tabs before opening this database."));
    };
    request.onsuccess = () => {
      if (failed) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}
export function readWorkspace(db: IDBDatabase): Promise<Workspace | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("workspace", "readonly"),
      request = tx.objectStore("workspace").get("current");
    let result: Workspace | null = null,
      error: unknown;
    request.onsuccess = () => {
      try {
        result =
          request.result === undefined
            ? null
            : validateWorkspace(request.result);
      } catch (e) {
        error = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () =>
      reject(error ?? tx.error ?? Error("Storage read aborted."));
  });
}
export function readRaw(db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("workspace", "readonly"),
      request = tx.objectStore("workspace").get("current");
    let raw = "null";
    request.onsuccess = () => {
      raw = JSON.stringify(request.result ?? null, null, 2);
    };
    tx.oncomplete = () => resolve(raw);
    tx.onabort = () => reject(tx.error);
  });
}
export function listBackups(db: IDBDatabase): Promise<Backup[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("backups", "readonly"),
      r = tx.objectStore("backups").getAll();
    let rows: Backup[] = [];
    r.onsuccess = () => {
      rows = r.result as Backup[];
    };
    tx.oncomplete = () => resolve(rows);
    tx.onabort = () => reject(tx.error);
  });
}
export function commit(
  db: IDBDatabase,
  draft: Workspace,
  expected: Pick<Workspace, "id" | "revision"> | null,
  replacement?: { raw: string; reason: string },
): Promise<Workspace> {
  const validated = validateWorkspace(draft);
  if (
    replacement &&
    new TextEncoder().encode(replacement.raw).length > MAX_BYTES
  )
    return Promise.reject(Error("Backup exceeds 8 MiB."));
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["workspace", "backups"], "readwrite"),
      store = tx.objectStore("workspace"),
      backups = tx.objectStore("backups");
    let result: Workspace, error: unknown;
    const fail = (e: unknown) => {
      error = e;
      tx.abort();
    };
    const r = store.get("current");
    r.onsuccess = () => {
      try {
        const current =
          r.result === undefined ? null : validateWorkspace(r.result);
        if (
          expected
            ? !current ||
              current.id !== expected.id ||
              current.revision !== expected.revision
            : current !== null
        )
          throw new ConflictError();
        if (
          !replacement &&
          expected &&
          (validated.id !== expected.id ||
            validated.revision !== expected.revision)
        )
          throw Error(
            "Draft identity or revision does not match its expected workspace.",
          );
        result = validateWorkspace({
          ...validated,
          id: replacement ? crypto.randomUUID() : validated.id,
          revision: replacement ? 0 : current ? current.revision + 1 : 0,
        });
        if (replacement) {
          const count = backups.count();
          count.onsuccess = () => {
            try {
              if (count.result >= 10)
                throw Error(
                  "Ten recovery snapshots already exist. Export and review them before starting a separate workspace; no snapshot was removed.",
                );
              backups.add({
                id: crypto.randomUUID(),
                created: new Date().toISOString(),
                raw: current ? JSON.stringify(current) : replacement.raw,
                reason: replacement.reason,
              } satisfies Backup);
              store.put(result, "current");
            } catch (e) {
              fail(e);
            }
          };
        } else store.put(result, "current");
      } catch (e) {
        fail(e);
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () =>
      reject(
        error ?? tx.error ?? Error("Save aborted. Your draft is retained."),
      );
  });
}
export function newWorkspace(): Workspace {
  return {
    schema: 2,
    id: crypto.randomUUID(),
    revision: 0,
    save: freshSave(),
    projects: [],
  };
}
export function importWorkspace(raw: string): Workspace {
  const value = parseImport(raw);
  return "schema" in value ? value : { ...newWorkspace(), save: value };
}
