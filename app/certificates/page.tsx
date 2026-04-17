import { Metadata } from "next";
import { CertificatesPage } from "@/components/certificates/CertificatesPage";

export const metadata: Metadata = {
  title: "Certificates | Student Tutor Platform",
  description: "View and manage your earned certificates",
};

export default function Certificates() {
  return <CertificatesPage />;
}


