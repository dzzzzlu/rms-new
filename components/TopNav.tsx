"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Role = "student" | "registrar" | "admin";

const NAV: Record<Role, { label: string; href: string }[]> = {
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "New Request", href: "/student/new-request" },
    { label: "History", href: "/student/history" },
    { label: "Profile", href: "/student/profile" },
  ],
  registrar: [
    { label: "Dashboard", href: "/registrar/dashboard" },
    { label: "Requests", href: "/registrar/requests" },
    { label: "Payments", href: "/registrar/payments" },
    { label: "Reports", href: "/registrar/reports" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Reports", href: "/admin/reports" },
  ],
};

export default function TopNav({ role, fullName }: { role: Role; fullName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-navy">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:py-5">
        {/* Left: Logo + school name */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" title="Back to home">
          <Image
            src="/logo-crest.png"
            alt="Regis Marie College"
            width={40}
            height={40}
            className="logo-ring"
          />
          <span className="font-heading hidden text-base font-bold text-white sm:inline">
            Regis Marie College
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden flex-1 justify-center gap-2 md:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <Home size={15} /> Home
          </Link>
          {NAV[role].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-navy"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Avatar + name + logout */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-navy">
            {fullName?.charAt(0).toUpperCase() || "?"}
          </span>
          <span className="text-sm font-semibold text-white">{fullName}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              <Home size={16} /> Home
            </Link>
            {NAV[role].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-white/10" />
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-navy">
                {fullName?.charAt(0).toUpperCase() || "?"}
              </span>
              <span className="text-sm font-semibold text-white">{fullName}</span>
            </div>
            <button
              onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
