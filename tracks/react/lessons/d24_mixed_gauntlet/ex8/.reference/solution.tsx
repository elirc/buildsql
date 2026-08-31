// d24_mixed_gauntlet / ex8 - reference solution.
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type WizardValue = {
  index: number;
  total: number;
  next: () => void;
  back: () => void;
};

const WizardContext = createContext<WizardValue | null>(null);

function useWizard(): WizardValue {
  const value = useContext(WizardContext);
  if (value === null) throw new Error("Wizard parts must be used inside <Wizard>");
  return value;
}

export function Wizard({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);

  // Separate the steps from everything else the caller wrote, so the nav can
  // sit anywhere among them and only one step is ever rendered.
  const all = Children.toArray(children);
  const steps = all.filter((child) => isValidElement(child) && child.type === Step);
  const rest = all.filter((child) => !(isValidElement(child) && child.type === Step));

  const value: WizardValue = {
    index,
    total: steps.length,
    next: () => setIndex((current) => Math.min(current + 1, steps.length - 1)),
    back: () => setIndex((current) => Math.max(current - 1, 0)),
  };

  return (
    <WizardContext.Provider value={value}>
      <div>
        {/* Children.toArray gives each child a key, so moving to another step
            really unmounts this one and mounts that one - which is what makes
            the mount effect in Step fire again. */}
        {steps[index]}
        {rest}
      </div>
    </WizardContext.Provider>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);

  // The step that was on screen has just been removed, taking the focused
  // element with it. Something has to catch the keyboard, and the heading of
  // what replaced it is the honest answer.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section>
      {/* tabIndex -1 makes it focusable by script without putting it in the
          tab order. */}
      <h2 tabIndex={-1} ref={heading}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Nav() {
  const { index, total, next, back } = useWizard();

  return (
    <>
      <p role="status">
        Step {index + 1} of {total}
      </p>
      <button type="button" disabled={index === 0} onClick={back}>
        Back
      </button>
      <button type="button" disabled={index === total - 1} onClick={next}>
        Next
      </button>
    </>
  );
}

Wizard.Step = Step;
Wizard.Nav = Nav;
