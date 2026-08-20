"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white">
        <Home size={16} /> Back to home
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <Image
            src="/logo-crest.png"
            alt="Regis Marie College"
            width={64}
            height={64}
            className="mx-auto mb-3 logo-ring"
          />
          <h1 className="font-heading text-xl font-bold">Regis Marie College</h1>
          <p className="text-sm text-white/60">Academic Document Request System</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
