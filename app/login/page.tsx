import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Student Tutor Platform",
  description: "Sign in to access your Student Tutor Platform learning dashboard",
};

export default function LoginPage() {
  return <LoginForm />;
}


