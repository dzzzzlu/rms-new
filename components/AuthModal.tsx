"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({
  initialView,
  onClose,
}: {
  initialView: "login" | "register";
  onClose: () => void;
}) {
  const [view, setView] = useState(initialView);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <X size={20} />
        </button>
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-crest.png"
            alt="Regis Marie College"
            width={52}
            height={52}
            className="logo-ring"
          />
        </div>
        {view === "login" ? (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
