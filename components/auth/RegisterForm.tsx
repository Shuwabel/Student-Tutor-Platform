"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  BookOpen,
  Users,
} from "lucide-react";

const roles = [
  {
    value: "student" as const,
    label: "Student",
    description: "I want to learn",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    value: "tutor" as const,
    label: "Tutor",
    description: "I want to teach",
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: "both" as const,
    label: "Both",
    description: "I learn & teach",
    icon: <BookOpen className="h-5 w-5" />,
  },
];

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "tutor" | "both",
  });
  const [error, setError] = useState("");
  const { register, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await register(formData);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel â€” branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.52 0.15 162), oklch(0.45 0.14 210), oklch(0.38 0.13 240))",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            Student Tutor Platform
          </span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Start your learning journey today
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Join 12,000+ students and tutors building their future on
            Student Tutor Platform. Free to start, no credit card required.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { stat: "500+", label: "Expert Tutors" },
              { stat: "50+", label: "Subjects" },
              { stat: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{s.stat}</p>
                <p className="text-xs text-white/70 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/50">
          Â© {new Date().getFullYear()} Student Tutor Platform
        </p>
      </div>

      {/* Right panel â€” form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold">
              Edu<span className="text-primary">Connect</span>
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose your role and start learning or teaching
            </p>
          </div>

          {error && (
            <Alert className="border-destructive/30 bg-destructive/10 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">I am a</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: role.value }))
                    }
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all ${
                      formData.role === role.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        formData.role === role.value
                          ? "bg-primary/15"
                          : "bg-muted"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <span className="text-sm font-bold">{role.label}</span>
                    <span className="text-xs">{role.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold"
                >
                  Confirm
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2 text-base font-bold shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary hover:bg-secondary/20 transition-colors"
            >
              Or try the demo â†’
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


