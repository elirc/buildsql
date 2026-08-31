// d18_context_reducer_apps / ex5 - reference solution.
import {
  createContext,
  useContext,
  useId,
  useReducer,
  useState,
  type ReactNode,
} from "react";

// A union rather than a bag of booleans: there is no way to write down
// "pending and also failed", so there is no way to render it either.
type AuthState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "done"; name: string }
  | { status: "error"; message: string };

type AuthAction =
  | { type: "started" }
  | { type: "succeeded"; name: string }
  | { type: "failed"; message: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "started":
      return { status: "pending" };
    case "succeeded":
      return { status: "done", name: action.name };
    case "failed":
      return { status: "error", message: action.message };
  }
}

const AuthContext = createContext<{
  state: AuthState;
  submit: (email: string) => void;
} | null>(null);

function useAuth() {
  const value = useContext(AuthContext);
  if (value === null) throw new Error("useAuth must be used inside an AuthProvider");
  return value;
}

export function AuthProvider({
  signIn,
  children,
}: {
  signIn: (email: string) => Promise<string>;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(authReducer, { status: "idle" } as AuthState);

  function submit(email: string) {
    // Three dispatches for one request: before it goes out, and on each of the
    // two ways it can come back.
    dispatch({ type: "started" });
    signIn(email).then(
      (name) => dispatch({ type: "succeeded", name }),
      (reason: unknown) =>
        dispatch({
          type: "failed",
          message: reason instanceof Error ? reason.message : String(reason),
        }),
    );
  }

  return <AuthContext.Provider value={{ state, submit }}>{children}</AuthContext.Provider>;
}

export function SignInForm() {
  const id = useId();
  const { state, submit } = useAuth();
  const [email, setEmail] = useState("");

  if (state.status === "done") return null;

  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} value={email} onChange={(event) => setEmail(event.target.value)} />
      <button
        type="button"
        disabled={state.status === "pending"}
        onClick={() => submit(email)}
      >
        Sign in
      </button>
    </>
  );
}

export function AuthStatus() {
  const { state } = useAuth();

  if (state.status === "error") return <p role="alert">{state.message}</p>;
  if (state.status === "pending") return <p role="status">Signing in</p>;
  if (state.status === "done") return <p role="status">Hello {state.name}</p>;
  return <p role="status">Signed out</p>;
}
