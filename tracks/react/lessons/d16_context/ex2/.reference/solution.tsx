// d16_context / ex2 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

// null is the only honest default: there is no sensible workspace name for a
// component rendered outside every provider.
const WorkspaceContext = createContext<string | null>(null);

export function WorkspaceProvider({ name, children }: { name: string; children: ReactNode }) {
  return <WorkspaceContext.Provider value={name}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): string {
  const name = useContext(WorkspaceContext);
  if (name === null) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return name;
}

export function WorkspaceName() {
  return <p role="status">Workspace: {useWorkspace()}</p>;
}
