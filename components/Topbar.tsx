"use client";

import { Menu, Bell } from "lucide-react";

export default function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-gold/40 bg-white/90 px-5 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg border border-gray-200 p-2 text-navy lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-navy">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-navy/40" aria-hidden>
        <Bell size={18} />
      </div>
    </header>
  );
}
