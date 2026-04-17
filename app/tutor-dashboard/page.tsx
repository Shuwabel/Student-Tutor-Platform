import type { Metadata } from "next";
import { MainNav } from "@/components/layout/MainNav";
import { TutorDashboard } from "@/components/dashboard/TutorDashboard";

export const metadata: Metadata = {
  title: "Tutor Dashboard | Student Tutor Platform",
  description: "Manage your courses, students, and live teaching sessions",
};

export default function TutorDashboardPage() {
  return (
    <>
      <MainNav />
      <TutorDashboard />
    </>
  );
}


