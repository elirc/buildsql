// d04_state_basics / ex6 - reference solution.
import { useState } from "react";

const INITIAL = { channels: { email: true, sms: false }, quietHours: false };

export function NotificationSettings() {
  const [settings, setSettings] = useState(INITIAL);

  function toggleChannel(channel: "email" | "sms") {
    setSettings((current) => ({
      ...current,
      channels: { ...current.channels, [channel]: !current.channels[channel] },
    }));
  }

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={settings.channels.email}
        onClick={() => toggleChannel("email")}
      >
        Email
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={settings.channels.sms}
        onClick={() => toggleChannel("sms")}
      >
        SMS
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={settings.quietHours}
        onClick={() => setSettings((current) => ({ ...current, quietHours: !current.quietHours }))}
      >
        Quiet hours
      </button>
      <button type="button" onClick={() => setSettings(INITIAL)}>
        Revert
      </button>
    </>
  );
}
