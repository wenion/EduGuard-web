"use client";

import { useState } from "react";
import HomeView from "@/components/screens/HomeView";
import DashboardView from "@/components/screens/DashboardView";
import SettingsView from "@/components/screens/SettingsView";

type Screen = "home" | "dashboard" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="space-y-6 p-4">
      {/* Navigation */}
      <nav className="flex gap-3">
        <button onClick={() => setScreen("home")} className="border rounded px-3 py-2">
          Home
        </button>
        <button onClick={() => setScreen("dashboard")} className="border rounded px-3 py-2">
          Dashboard
        </button>
        <button onClick={() => setScreen("settings")} className="border rounded px-3 py-2">
          Settings
        </button>
      </nav>

      {/* Screen rendering */}
      {screen === "home" && <HomeView setScreen={setScreen} />}
      {screen === "dashboard" && <DashboardView />}
      {screen === "settings" && <SettingsView />}
    </div>
  );
}
