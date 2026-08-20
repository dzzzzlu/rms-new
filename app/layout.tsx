import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const heading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Regis Marie College | Document Request System",
  description: "Web-based academic document request and analytics system",
  icons: { icon: "/logo-crest.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
