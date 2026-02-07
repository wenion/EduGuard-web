"use client";

import { cn } from "@/lib/utils"

import { HeaderDropdownMenu } from "./HeaderDropdownMenu";

export default function Header() {
  return (
    <header
      className={cn(
        "flex items-center justify-between",
        "bg-primary text-white", // change to your brand bg
        "p-4 shadow-sm",
        "top-0 left-0 w-full z-50"
      )}
    >
      <h1 className="text-3xl w-3/4 font-playfair">
        <span className="inline lg:hidden">Edvance</span>
        <span className="hidden lg:inline">
          Edvance: <i>Empowering All to Thrive</i>
        </span>
      </h1>
      <HeaderDropdownMenu />
    </header>
  );
}
