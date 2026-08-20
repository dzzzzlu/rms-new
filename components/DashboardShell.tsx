"use client";

import TopNav from "./TopNav";

export default function DashboardShell({
  role,
  fullName,
  title,
  children,
}: {
  role: "student" | "registrar" | "admin";
  fullName: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopNav role={role} fullName={fullName} />
      <main className="mx-auto max-w-6xl px-5 py-8">
        {title && <h1 className="font-heading mb-6 text-2xl font-bold text-navy">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
