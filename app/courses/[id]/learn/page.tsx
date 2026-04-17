import { LearningMaterial } from "@/components/courses/LearningMaterial";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Learning | Student Tutor Platform",
  description: "Access your course materials and track your progress",
};

export default function CourseLearningPage({
  params,
}: {
  params: { id: string };
}) {
  return <LearningMaterial courseId={params.id} />;
}


