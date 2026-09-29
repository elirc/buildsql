import { useEffect, useRef, useState } from "react";
import type { Workspace } from "./contracts";
import { SAVE_KEY } from "./progression";
import {
  commit,
  importWorkspace,
  listBackups,
  newWorkspace,
  openDatabase,
  readRaw,
  readWorkspace,
  type Backup,
} from "./storage";

export function downloadText(name: string, raw: string) {
  const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function useWorkspace() {
  const [draft, setDraft] = useState<Workspace | null>(null),
    [loading, setLoading] = useState(true),
    [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [legacy, setLegacy] = useState<string | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const database = useRef<IDBDatabase | null>(null),
    expected = useRef<Workspace | null>(null),
    working = useRef<Workspace | null>(null),
    inflight = useRef(false),
    channel = useRef<BroadcastChannel | null>(null);
  const dirtyRef = useRef(false);
  useEffect(() => {
    let alive = true,
      owned: IDBDatabase | null = null;
    openDatabase()
      .then(async (db) => {
        owned = db;
        if (!alive) {
          db.close();
          return;
        }
        database.current = db;
        const current = await readWorkspace(db);
        if (!alive) return;
        expected.current = current;
        working.current = current;
        setDraft(current);
        if (!current) setLegacy(localStorage.getItem(SAVE_KEY));
        setBackups(await listBackups(db));
      })
      .catch((e) => {
        if (alive)
          setError(
            e instanceof Error ? e.message : "Cannot read browser storage.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    const broadcast =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel("ipskill-workspace-v2");
    channel.current = broadcast;
    if (broadcast)
      broadcast.onmessage = () => {
        if (alive)
          setNotice(
            "Another tab saved changes. Export unfinished work before loading current data.",
          );
      };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      alive = false;
      owned?.close();
      broadcast?.close();
      channel.current = null;
      window.removeEventListener("beforeunload", unload);
    };
  }, []);
  function edit(change: (value: Workspace) => Workspace) {
    if (inflight.current || !working.current) return;
    try {
      const next = change(working.current);
      working.current = next;
      setDraft(next);
      setDirty(true);
      dirtyRef.current = true;
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Change rejected; draft retained.",
      );
    }
  }
  async function run(action: () => Promise<void>) {
    if (inflight.current) return;
    inflight.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Storage operation failed. Draft retained.",
      );
    } finally {
      inflight.current = false;
      setBusy(false);
    }
  }
  function accept(value: Workspace) {
    expected.current = value;
    working.current = value;
    setDraft(value);
    setDirty(false);
    dirtyRef.current = false;
  }
  function save() {
    return run(async () => {
      if (!database.current || !working.current)
        throw Error("Workspace is not ready.");
      const value = await commit(
        database.current,
        working.current,
        expected.current,
      );
      accept(value);
      setNotice(`Saved locally at revision ${value.revision}.`);
      channel.current?.postMessage("saved");
    });
  }
  function initialize(useLegacy: boolean) {
    return run(async () => {
      if (!database.current)
        throw Error(
          "Storage is unavailable. Preserve the existing data and retry loading.",
        );
      if (legacy && !useLegacy)
        throw Error(
          "Existing legacy data needs explicit import review. Export it before starting in another browser profile.",
        );
      const candidate =
        useLegacy && legacy ? importWorkspace(legacy) : newWorkspace();
      const value = await commit(
        database.current,
        candidate,
        null,
        useLegacy && legacy
          ? { raw: legacy, reason: "Reviewed legacy migration" }
          : undefined,
      );
      accept(value);
      setBackups(await listBackups(database.current));
      setNotice("Local workspace ready. Save changes explicitly.");
      channel.current?.postMessage("saved");
    });
  }
  function reload() {
    return run(async () => {
      if (
        dirtyRef.current &&
        !window.confirm(
          "Discard this unsaved workspace draft and load current accepted data? Export first if needed.",
        )
      )
        return;
      if (!database.current)
        throw Error(
          "Storage is unavailable. Reload the page to retry opening it.",
        );
      const value = await readWorkspace(database.current);
      if (!value)
        throw Error(
          "The accepted workspace is missing. Export your draft; no empty replacement was created.",
        );
      accept(value);
      setBackups(await listBackups(database.current));
      setNotice("Current accepted data loaded.");
    });
  }
  function replace(raw: string) {
    return run(async () => {
      if (dirtyRef.current)
        throw Error(
          "Save or export and discard current draft changes before replacing the workspace.",
        );
      if (!database.current || !expected.current)
        throw Error("Initialize or recover the current workspace first.");
      const candidate = importWorkspace(raw);
      const value = await commit(
        database.current,
        candidate,
        expected.current,
        { raw, reason: "Reviewed import; prior accepted workspace" },
      );
      accept(value);
      setBackups(await listBackups(database.current));
      setNotice(
        "Reviewed import accepted. The earlier workspace is in recovery snapshots.",
      );
      channel.current?.postMessage("saved");
    });
  }
  function exportDraft() {
    if (working.current)
      downloadText(
        "ipskill-workspace-draft.json",
        JSON.stringify(working.current, null, 2),
      );
  }
  function exportRaw() {
    return run(async () => {
      if (!database.current) throw Error("Storage is unavailable.");
      downloadText(
        "ipskill-accepted-raw.json",
        await readRaw(database.current),
      );
    });
  }
  return {
    draft,
    loading,
    dirty,
    error,
    notice,
    busy,
    legacy,
    backups,
    edit,
    save,
    initialize,
    reload,
    replace,
    exportDraft,
    exportRaw,
    setError,
  };
}
