import type React from "react";
import { MainNav } from "@/components/layout/MainNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Student Tutor Platform",
  description: "Student dashboard for the Student Tutor Platform",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}


