import { Metadata } from "next";
import { StudyMaterialsPage } from "@/components/study-materials/StudyMaterialsPage";

export const metadata: Metadata = {
  title: "Study Materials | Student Tutor Platform",
  description: "Access study guides and past questions for your courses",
};

export default function Page() {
  return <StudyMaterialsPage />;
}


