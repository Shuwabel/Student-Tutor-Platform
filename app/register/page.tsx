import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Student Tutor Platform",
  description: "Create your Student Tutor Platform account and start learning today",
};

export default function RegisterPage() {
  return <RegisterForm />;
}


