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

export default function Sidebar({ role, fullName }: { role: Role; fullName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-navy z-30">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <Image
            src="/logo-crest.png"
            alt="Regis Marie College"
            width={36}
            height={36}
            className="logo-ring"
          />
          <span className="font-heading text-sm font-bold text-white">Regis Marie College</span>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV[role].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-white text-navy" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            <Home size={16} /> Home
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-navy p-2 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-64 bg-navy"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
              <Image
                src="/logo-crest.png"
                alt="Regis Marie College"
                width={36}
                height={36}
                className="logo-ring"
              />
              <span className="font-heading text-sm font-bold text-white">Regis Marie College</span>
            </div>
            <nav className="px-3 py-4">
              {NAV[role].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      active ? "bg-white text-navy" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 px-3 py-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
                <Home size={16} /> Home
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
