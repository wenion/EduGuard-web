"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import Header from "@/components/screens/Header";
import LoginView from "@/components/screens/LoginView";
import HomeView from "@/components/screens/HomeView";
import DashboardView from "@/components/screens/DashboardView";
import SettingsView from "@/components/screens/SettingsView";

type Screen = "home" | "dashboard" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="space-y-6 p-4">
      {/* Navigation */}
      <Header />

      {/* Screen rendering */}
      {screen === "home" && <HomeView setScreen={setScreen} />}
      {screen === "dashboard" &&
        isAuthenticated ? <DashboardView /> : <LoginView />}
      {screen === "settings" && <SettingsView />}
    </div>
  );
}
