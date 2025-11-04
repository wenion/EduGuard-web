// components/screens/SettingsView.tsx
"use client";

import { useState } from "react";

export default function SettingsView() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <section>
      <h2 className="text-lg font-medium mb-2">Settings</h2>
      <label className="flex items-center gap-2">
        <span>Theme</span>
        <select className="border rounded px-2 py-1" value={theme} onChange={e => setTheme(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </section>
  );
}
