// d23_component_patterns / ex8 - reference solution.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

type PopoverValue = {
  open: boolean;
  contentId: string;
  toggle: () => void;
  close: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const PopoverContext = createContext<PopoverValue | null>(null);

function usePopover(): PopoverValue {
  const value = useContext(PopoverContext);
  if (value === null) throw new Error("Popover parts must be used inside <Popover>");
  return value;
}

export function Popover({ children }: { children: ReactNode }) {
  // The id lives here because it is the one component that contains both the
  // trigger that names it and the content that answers to it.
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(() => setOpen((current) => !current), []);

  const close = useCallback(() => {
    setOpen(false);
    // The element that had focus is about to be removed, so somebody has to
    // catch it - and the trigger is where the user was before they opened it.
    triggerRef.current?.focus();
  }, []);

  const value = useMemo<PopoverValue>(
    () => ({ open, contentId, toggle, close, triggerRef }),
    [open, contentId, toggle, close],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

function Trigger({ children }: { children: ReactNode }) {
  const { open, contentId, toggle, triggerRef } = usePopover();
  return (
    <button
      type="button"
      ref={triggerRef}
      aria-expanded={open}
      // Only while the content exists: a reference to a missing id is a dead
      // link as far as a screen reader is concerned.
      aria-controls={open ? contentId : undefined}
      onClick={toggle}
    >
      {children}
    </button>
  );
}

function Content({ children }: { children: ReactNode }) {
  const { open, contentId, close } = usePopover();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const first = box.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]",
    );
    first?.focus();
  }, [open]);

  if (!open) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") close();
  }

  return (
    <div id={contentId} ref={box} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

Popover.Trigger = Trigger;
Popover.Content = Content;
