"use client";

import { cn } from "@/lib/utils"

export default function Header() {
  return (
    <header
      className={cn(
        "flex items-center justify-between",
        "bg-sky-700 text-white", // change to your brand bg
        "p-4 shadow-sm",
        "fixed top-0 left-0 w-full z-50"
      )}
    >
      <h1 className="text-xl font-bold w-3/4">
        <span className="inline lg:hidden">Edvance</span>
        <span className="hidden lg:inline">
          Edvance: <i>Empowering All to Thrive</i>
        </span>
      </h1>
    </header>
  );
}
