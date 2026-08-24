import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CopyProtection from "@/components/CopyProtection";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaishnav Shinde — Intelligent Systems Developer",
  description: "Portfolio of Vaishnav Shinde, building thoughtful systems across AI, backend engineering and Web3.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.className}>
      <body style={{ userSelect: "none", WebkitUserSelect: "none" }}>
        <CopyProtection />
        {children}
      </body>
    </html>
  );
}