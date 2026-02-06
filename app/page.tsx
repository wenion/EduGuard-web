"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useEventTracking } from "@/context/Logger";

import Header from "@/components/screens/Header";
import LoginView from "@/components/screens/LoginView";
import HomeView from "@/components/screens/HomeView";
import DashboardView from "@/components/screens/DashboardView";
import SettingsView from "@/components/screens/SettingsView";

type Screen = "home" | "dashboard" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const searchParams = useSearchParams();
  const authError = searchParams.get("authError");
  const { isAuthenticated } = useAuth();
  useEventTracking();

  return (
    <div className="space-y-6">
      <Header />

      {/* Screen rendering */}
      {screen === "home" && <HomeView setScreen={setScreen} />}
      {screen === "dashboard" &&
        <main id="mainContent" attr-class="body-container" className="mx-4">
          {isAuthenticated ? <DashboardView /> : <LoginView authError={authError} /> }
        </main>
      }
      {screen === "settings" && <SettingsView />}
    </div>
  );
}
