"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Monitor,
} from "lucide-react";
import Link from "next/link";

const roles = [
  {
    key: "student" as const,
    title: "Student",
    subtitle: "Explore the student experience",
    description:
      "Browse courses, track your progress, view upcoming live classes, and take assessments. See exactly what a student sees on Student Tutor Platform.",
    icon: <GraduationCap className="h-8 w-8" />,
    features: [
      "4 enrolled courses with progress tracking",
      "Upcoming live classes with meeting links",
      "Quiz and exam interface",
      "Course catalog browsing",
    ],
    account: "Alex Thompson",
  },
  {
    key: "tutor" as const,
    title: "Tutor",
    subtitle: "Explore the tutor experience",
    description:
      "Manage courses, schedule live sessions, create assessments, and monitor student performance. Full tutor workflow.",
    icon: <Users className="h-8 w-8" />,
    features: [
      "6 published courses to manage",
      "Schedule and start live classes",
      "Create quizzes and exams",
      "View student enrollments and grades",
    ],
    account: "Dr. Sarah Mitchell",
  },
  {
    key: "both" as const,
    title: "Student & Tutor",
    subtitle: "Experience both sides",
    description:
      "Some users learn and teach. See both dashboards â€” switch between student and tutor views seamlessly.",
    icon: <BookOpen className="h-8 w-8" />,
    features: [
      "Student dashboard with enrolled courses",
      "Tutor dashboard with created courses",
      "Combined live class schedule",
      "Full feature access",
    ],
    account: "Jordan Rivera",
  },
];

export default function DemoPage() {
  const { loginAsDemo, isLoading } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDemoLogin = async (role: "student" | "tutor" | "both") => {
    setError("");
    setLoadingRole(role);
    try {
      await loginAsDemo(role);
    } catch (err) {
      console.error("Demo login error:", err);
      setError(
        "Demo accounts are not yet configured. Please run the seed script in Supabase first."
      );
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Simple header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground">
              Edu<span className="text-primary">Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
              <Monitor className="h-4 w-4" />
              Interactive Demo
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Try Student Tutor Platform{" "}
              <span
                className="inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.38 0.13 240), oklch(0.52 0.15 162))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                without signing up
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pick a role below and instantly explore a fully populated platform
              â€” real courses, live classes, assessments, and progress data.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-auto mt-8 max-w-xl rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Role cards */}
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.key}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Top accent */}
                <div
                  className="h-1.5"
                  style={{
                    background:
                      role.key === "student"
                        ? "oklch(0.38 0.13 240)"
                        : role.key === "tutor"
                        ? "oklch(0.52 0.15 162)"
                        : "linear-gradient(90deg, oklch(0.38 0.13 240), oklch(0.52 0.15 162))",
                  }}
                />

                <div className="flex flex-1 flex-col p-8">
                  {/* Icon + title */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>

                  {/* Feature list */}
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {role.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Account info */}
                  <div className="mt-6 rounded-lg bg-muted/50 px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Logged in as
                    </p>
                    <p className="text-sm font-bold">{role.account}</p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleDemoLogin(role.key)}
                    disabled={isLoading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingRole === role.key ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Enter as {role.title}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Demo accounts are read-only. To create your own courses and track
            real progress,{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              sign up for free
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}


