import type { Metadata } from "next";
import "./globals.css";
import CopyProtection from "@/components/CopyProtection";

export const metadata: Metadata = {
  title: "Vaishnav Shinde — Intelligent Systems Developer",
  description: "Portfolio of Vaishnav Shinde, building thoughtful systems across AI, backend engineering and Web3.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ userSelect: "none", WebkitUserSelect: "none" }}>
        <CopyProtection />
        {children}
      </body>
    </html>
  );
}