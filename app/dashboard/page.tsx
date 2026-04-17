import type { Metadata } from "next";
import { MainNav } from "@/components/layout/MainNav";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export const metadata: Metadata = {
  title: "Dashboard | Student Tutor Platform",
  description: "Track your courses, progress, and upcoming live sessions",
};

export default function DashboardPage() {
  return (
    <>
      <MainNav />
      <StudentDashboard />
    </>
  );
}


