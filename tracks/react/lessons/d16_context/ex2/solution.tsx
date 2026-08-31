// d16_context / ex2 - a default that hides a wiring mistake.
// See tracks/react/lessons/d16_context/README.md, "Exercise 2".
import { createContext, useContext, type ReactNode } from "react";

const WorkspaceContext = createContext("Untitled");

export function WorkspaceProvider({ name, children }: { name: string; children: ReactNode }) {
  return <WorkspaceContext.Provider value={name}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): string {
  return useContext(WorkspaceContext);
}

export function WorkspaceName() {
  return <p role="status">Workspace: {useWorkspace()}</p>;
}
