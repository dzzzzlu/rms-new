"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ClipboardCheck,
  BarChart3,
  FilePlus,
  MapPin,
  History,
  ListChecks,
  CreditCard,
  Upload,
  Users,
  TrendingUp,
  FileBarChart,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/AuthModal";

type Role = "home" | "student" | "registrar" | "admin";

const CONTENT: Record<
  Role,
  {
    eyebrow?: string;
    title: string;
    sub: string;
    cards: { Icon: any; title: string; desc: string }[];
  }
> = {
  home: {
    eyebrow: "RMC WILDCATS",
    title: "Request your academic documents, fully online",
    sub: "Transcripts, certificates, and diplomas — track every request from submission to pickup.",
    cards: [
      { Icon: FileText, title: "For students", desc: "Request documents and pay via GCash." },
      { Icon: ClipboardCheck, title: "For the registrar", desc: "Verify payments and update statuses." },
      { Icon: BarChart3, title: "For administrators", desc: "Manage accounts and view analytics." },
    ],
  },
  student: {
    eyebrow: "STUDENT PORTAL",
    title: "Your documents, one tap away",
    sub: "Request a transcript, pay via GCash, and watch it move from pending to ready — no more lining up at the registrar's window.",
    cards: [
      { Icon: FilePlus, title: "New request", desc: "Start a fresh document request in minutes." },
      { Icon: MapPin, title: "Track status", desc: "Follow your request from pending to ready." },
      { Icon: History, title: "Request history", desc: "Review everything you've requested before." },
    ],
  },
  registrar: {
    eyebrow: "REGISTRAR PORTAL",
    title: "Keep every request moving",
    sub: "Verify GCash payments, update statuses in one click, and export reports — all requests in one queue.",
    cards: [
      { Icon: ListChecks, title: "Manage requests", desc: "See and update every request in one queue." },
      { Icon: CreditCard, title: "Verify payments", desc: "Confirm GCash references before processing." },
      { Icon: Upload, title: "Export reports", desc: "Pull request and revenue data anytime." },
    ],
  },
  admin: {
    eyebrow: "ADMIN PORTAL",
    title: "See the whole system at a glance",
    sub: "Manage user roles, watch demand trends by document and month, and keep the institution's data exportable.",
    cards: [
      { Icon: Users, title: "Manage users", desc: "Control roles and access across the system." },
      { Icon: TrendingUp, title: "Analytics", desc: "Track demand by status, month, and document." },
      { Icon: FileBarChart, title: "Reports", desc: "Institution-wide, exportable at any time." },
    ],
  },
};

const TABS: { key: Role; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "student", label: "Student" },
  { key: "registrar", label: "Registrar" },
  { key: "admin", label: "Admin" },
];

export default function Home() {
  const [role, setRole] = useState<Role>("home");
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [user, setUser] = useState<{ name: string; home: string } | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const c = CONTENT[role];
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .single();
      const home =
        profile?.role === "admin"
          ? "/admin/dashboard"
          : profile?.role === "registrar"
          ? "/registrar/dashboard"
          : "/student/dashboard";
      setUser({ name: profile?.full_name ?? "My Account", home });
    });
  }, [supabase]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-5 sm:px-10 lg:py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-crest.png"
            alt="Regis Marie College"
            width={48}
            height={48}
            className="logo-ring"
          />
          <div>
            <p className="font-heading text-base font-bold leading-tight text-navy">Regis Marie College</p>
            <p className="text-sm text-gray-400">Document Request System</p>
          </div>
        </div>

        {/* Center tabs (desktop) */}
        <nav className="hidden gap-2 md:flex" aria-label="Portal preview">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setRole(t.key)}
              aria-pressed={role === t.key}
              className={`nav-pill ${role === t.key ? "nav-pill-active" : "nav-pill-inactive"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href={user.home} className="flex items-center gap-2 rounded-full bg-navy/5 py-2 pl-2 pr-4 transition hover:bg-navy/10">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-semibold text-navy">{user.name}</span>
            </Link>
          ) : (
            <button onClick={() => setModal("login")} className="btn-primary">
              Log in
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="rounded-lg p-2 text-navy md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNav ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {mobileNav && (
        <div className="border-b border-gray-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setRole(t.key); setMobileNav(false); }}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition ${
                  role === t.key ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        {/* Hero */}
        <section className="rounded-2xl bg-navy p-10 text-white sm:p-14">
          {c.eyebrow && <p className="mb-3 text-xs font-bold tracking-widest text-gold">{c.eyebrow}</p>}
          <h1 className="font-heading max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">{c.title}</h1>
          <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">{c.sub}</p>
          {role === "home" && (
            <button onClick={() => setModal("register")} className="btn-gold mt-8 inline-flex">
              Get started
            </button>
          )}
        </section>

        {/* Feature cards */}
        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {c.cards.map((f) => (
            <div key={f.title} className="card-interactive">
              <f.Icon className="card-icon mb-3" size={26} strokeWidth={1.75} />
              <h2 className="font-heading font-semibold text-navy">{f.title}</h2>
              <p className="mt-1 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {modal && (
        <AuthModal
          initialView={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
