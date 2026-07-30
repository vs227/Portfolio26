import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaishnav Shinde — Intelligent Systems Developer",
  description: "Portfolio of Vaishnav Shinde, building thoughtful systems across AI, backend engineering and Web3.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}