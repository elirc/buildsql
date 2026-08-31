// d07_discriminated_unions / ex5 - reference solution (author only).

export type UiEvent =
  | { type: "click"; button: 0 | 1 | 2 }
  | { type: "key"; key: string; repeat: boolean }
  | { type: "scroll"; dy: number };

const BUTTON_NAMES = ["left", "middle", "right"] as const;

export function route(events: readonly UiEvent[]): string[] {
  return events.map((event) => {
    switch (event.type) {
      case "click":
        return `click:${BUTTON_NAMES[event.button]}`;
      case "key":
        return event.repeat ? `key:${event.key}(repeat)` : `key:${event.key}`;
      case "scroll":
        if (event.dy === 0) {
          return "scroll:none";
        }
        return event.dy < 0 ? `scroll:up:${-event.dy}` : `scroll:down:${event.dy}`;
    }
  });
}
