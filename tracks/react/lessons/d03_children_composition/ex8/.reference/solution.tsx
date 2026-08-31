// d03_children_composition / ex8 - reference solution.
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type FormFieldContextValue = { controlId: string; hintId: string | undefined };

const FormFieldContext = createContext<FormFieldContextValue>({
  controlId: "",
  hintId: undefined,
});

function FormFieldRoot({ children }: { children: ReactNode }) {
  const id = useId();
  const hasHint = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === Hint,
  );

  return (
    <FormFieldContext.Provider
      value={{ controlId: `${id}-control`, hintId: hasHint ? `${id}-hint` : undefined }}
    >
      <div>{children}</div>
    </FormFieldContext.Provider>
  );
}

function Label({ children }: { children: ReactNode }) {
  const { controlId } = useContext(FormFieldContext);
  return <label htmlFor={controlId}>{children}</label>;
}

function Control(props: ComponentPropsWithoutRef<"input">) {
  const { controlId, hintId } = useContext(FormFieldContext);
  return <input id={controlId} aria-describedby={hintId} {...props} />;
}

function Hint({ children }: { children: ReactNode }) {
  const { hintId } = useContext(FormFieldContext);
  return <p id={hintId}>{children}</p>;
}

export const FormField = Object.assign(FormFieldRoot, { Label, Control, Hint });
