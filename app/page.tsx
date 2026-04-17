import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  TrendingUp,
  Award,
  Clock,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "Student Tutor Platform â€” Learn Without Limits",
  description:
    "Connect with expert tutors, master any subject, and track your academic progress with Student Tutor Platform.",
};

const stats = [
  { value: "12,000+", label: "Active Students" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "500+", label: "Expert Tutors" },
  { value: "50+", label: "Subjects Covered" },
];

const features = [
  {
    icon: <Users className="h-7 w-7" />,
    title: "Verified Expert Tutors",
    description:
      "Every tutor is background-checked and interview-tested. Only the top 5% of applicants make it onto our platform.",
  },
  {
    icon: <Calendar className="h-7 w-7" />,
    title: "Flexible Scheduling",
    description:
      "Book sessions any time, any day. Our tutors are available across all timezones so you never have to wait.",
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: "Proven Progress Tracking",
    description:
      "Detailed weekly reports show you exactly how you're improving â€” lesson by lesson, topic by topic.",
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: "Structured Curriculums",
    description:
      "Personalised lesson plans built around your goals, your pace, and your learning style.",
  },
  {
    icon: <Award className="h-7 w-7" />,
    title: "Certificates of Completion",
    description:
      "Earn recognised certificates when you complete a course â€” worth adding to your CV or university application.",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "Live Interactive Classes",
    description:
      "Join live video sessions with your tutor and classmates. Ask questions, share screens, collaborate in real-time.",
  },
];

const testimonials = [
  {
    quote:
      "My calculus grade went from a C to an A in just six weeks. My tutor broke down every concept so clearly â€” something my lecturer never managed to do.",
    name: "Alex Johnson",
    role: "University Student, Mathematics",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    quote:
      "The scheduling was perfect around my sport commitments. I could book sessions at 9pm and my tutor was always ready and prepared. Incredible service.",
    name: "Samantha Lee",
    role: "A-Level Student, Chemistry",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    quote:
      "I went from dreading essays to genuinely enjoying writing. The personalised feedback changed how I think. My GPA has never been higher.",
    name: "Michael Rodriguez",
    role: "College Student, English Literature",
    avatar: "https://i.pravatar.cc/150?img=52",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* â”€â”€ NAVIGATION â”€â”€ */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Edu<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Tutors", "Subjects", "How It Works", "Pricing"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary hover:bg-secondary/20 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Try Demo
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="rounded-full px-5 shadow-md">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* â”€â”€ HERO â”€â”€ Fully centered */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          {/* Background decoration */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.38 0.13 240 / 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.52 0.15 162 / 0.1), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, oklch(0.58 0.16 240), oklch(0.60 0.17 162), oklch(0.58 0.16 240))",
              filter: "blur(100px)",
            }}
          />

          <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
              <Star className="h-3.5 w-3.5 fill-current" />
              Trusted by 12,000+ students worldwide
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Learn Smarter.{" "}
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
                Grow Faster.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
              Connect with world-class tutors who meet you where you are, push
              you to where you want to be, and stay with you every step of the
              journey.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                <Link href="/register">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-border/70 px-8 text-base hover:bg-muted transition-colors"
              >
                <Link href="#how-it-works">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Social proof avatars */}
            <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="flex -space-x-3">
                {[11, 47, 52, 33, 64, 12].map((n) => (
                  <div
                    key={n}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-background shadow-sm"
                  >
                    <Image
                      src={`https://i.pravatar.cc/80?img=${n}`}
                      alt="Student"
                      width={40}
                      height={40}
                    />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  <strong className="text-foreground">4.9/5</strong> from over
                  3,000 reviews
                </p>
              </div>
            </div>

            {/* Hero image / dashboard preview */}
            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/10 to-secondary/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Students learning together"
                  width={1200}
                  height={675}
                  className="w-full object-cover"
                  priority
                />
                {/* Floating overlay card â€” left */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/90 p-3 shadow-xl backdrop-blur-sm dark:bg-foreground/10 dark:border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground dark:text-background">
                      Grade Improvement
                    </p>
                    <p className="text-sm font-extrabold text-secondary">
                      +40% avg increase
                    </p>
                  </div>
                </div>
                {/* Floating overlay card â€” right */}
                <div className="absolute right-6 top-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/90 p-3 shadow-xl backdrop-blur-sm dark:bg-foreground/10 dark:border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground dark:text-background">
                      Sessions Today
                    </p>
                    <p className="text-sm font-extrabold text-primary">
                      847 live now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ STATS BAR â”€â”€ */}
        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <dt className="text-3xl font-extrabold text-primary sm:text-4xl">
                    {s.value}
                  </dt>
                  <dd className="text-sm font-semibold text-muted-foreground">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* â”€â”€ FEATURES â”€â”€ */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section header â€” centered */}
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-secondary">
                Why Student Tutor Platform
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Everything built for how students actually learn
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We spent years studying how students fail. Then we built a
                platform that attacks every single one of those failure points.
              </p>
            </div>

            {/* Feature grid â€” 3 columns, centered */}
            <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-secondary/3 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold">{f.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ HOW IT WORKS â”€â”€ */}
        <section
          id="how-it-works"
          className="py-24 sm:py-32"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.95 0.01 220), oklch(0.98 0.005 220))",
          }}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-secondary">
                How It Works
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Up and running in three steps
              </h2>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create your free account",
                  desc: "Sign up in under 60 seconds. Tell us your subject, your level, and your goals.",
                  icon: <GraduationCap className="h-8 w-8" />,
                },
                {
                  step: "02",
                  title: "Match with your tutor",
                  desc: "Our algorithm matches you with the perfect tutor based on your learning style and schedule.",
                  icon: <Users className="h-8 w-8" />,
                },
                {
                  step: "03",
                  title: "Start your first session",
                  desc: "Book a live session, join the video call, and start improving from day one.",
                  icon: <CheckCircle className="h-8 w-8" />,
                },
              ].map((s, i) => (
                <div key={i} className="relative text-center">
                  {/* Connector line between steps */}
                  {i < 2 && (
                    <div className="absolute left-[calc(50%+4rem)] top-10 hidden h-0.5 w-[calc(100%-4rem)] bg-border md:block" />
                  )}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    {s.icon}
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-secondary-foreground shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ TESTIMONIALS â”€â”€ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-secondary">
                Student Stories
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Real students. Real results.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Don&apos;t take our word for it â€” here&apos;s what students
                actually say after using Student Tutor Platform.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-8 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-secondary text-secondary"
                        />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-4 border-t border-border/40 pt-6">
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-secondary font-medium">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ CTA SECTION â”€â”€ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-20 text-center sm:px-16"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.38 0.13 240), oklch(0.45 0.14 210), oklch(0.48 0.15 175), oklch(0.52 0.15 162))",
              }}
            >
              {/* Background decorations */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl"
              />

              <div className="relative z-10">
                <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Ready to transform your grades?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-white/85">
                  Join 12,000+ students who chose Student Tutor Platform to get ahead.
                  Your first session is completely free.
                </p>

                {/* Inline signup form */}
                <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 flex-1 rounded-full border-white/20 bg-white/15 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/20 focus:ring-white/30"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 rounded-full bg-white px-8 text-primary font-extrabold shadow-xl hover:bg-white/90 hover:-translate-y-0.5 transition-all"
                  >
                    Get Started Free
                  </Button>
                </form>

                <p className="mt-4 text-sm text-white/60">
                  No credit card required Â· Cancel anytime Â· Free first session
                </p>

                {/* Social proof strip */}
                <div className="mx-auto mt-10 flex items-center justify-center gap-6 flex-wrap">
                  {[
                    { icon: <CheckCircle className="h-4 w-4" />, text: "Verified tutors" },
                    { icon: <Clock className="h-4 w-4" />, text: "24/7 availability" },
                    { icon: <Award className="h-4 w-4" />, text: "Certified courses" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                      {item.icon}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* â”€â”€ FOOTER â”€â”€ */}
      <footer className="border-t border-border/50 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
            {/* Brand column */}
            <div className="space-y-5 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-xl font-extrabold text-foreground">
                  Edu<span className="text-primary">Connect</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A modern academic platform built to help students reach their
                full potential through expert-led instruction.
              </p>
              <div className="flex gap-3">
                {["T", "L", "I", "Y"].map((l, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-xs font-bold text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Platform",
                links: ["Find a Tutor", "Browse Subjects", "Live Classes", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Become a Tutor", "Blog", "Careers"],
              },
              {
                title: "Support",
                links: ["Help Centre", "Contact Us", "Privacy Policy", "Terms of Service"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-foreground">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Â© {new Date().getFullYear()} Student Tutor Platform. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built with care for students everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


