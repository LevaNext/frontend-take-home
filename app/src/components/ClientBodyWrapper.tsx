"use client";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap" });

export default function ClientBodyWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`antialiased ${geistSans.className} ${geistMono.className}`}
    >
      {children}
    </div>
  );
}
