"use client";
import type { Dispatch, SetStateAction } from "react";
type Screen = "home" | "dashboard" | "settings";

export default function HomeView({
  setScreen,
}: {
  setScreen: Dispatch<SetStateAction<Screen>>;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Home</h2>
      <p>Welcome!</p>

      <button
        className="mt-3 border px-3 py-2 rounded"
        onClick={() => setScreen("dashboard")}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
