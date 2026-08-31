// d04_state_basics / ex6 - nested state, edited in place.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 6".
import { useState } from "react";

const INITIAL = { channels: { email: true, sms: false }, quietHours: false };

export function NotificationSettings() {
  const [settings, setSettings] = useState(INITIAL);

  function toggleChannel(channel: "email" | "sms") {
    settings.channels[channel] = !settings.channels[channel];
    setSettings({ ...settings });
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
        onClick={() => {
          settings.quietHours = !settings.quietHours;
          setSettings({ ...settings });
        }}
      >
        Quiet hours
      </button>
      <button type="button" onClick={() => setSettings(INITIAL)}>
        Revert
      </button>
    </>
  );
}
