import { Metadata } from "next";
import { CertificateVerificationPage } from "@/components/certificates/CertificateVerificationPage";

export const metadata: Metadata = {
  title: "Verify Certificate | Student Tutor Platform",
  description: "Verify the authenticity of a Student Tutor Platform certificate",
};

export default function VerifyCertificate({
  params,
}: {
  params: { id: string };
}) {
  return <CertificateVerificationPage credentialId={params.id} />;
}


