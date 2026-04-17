"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [reset, setReset] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook, isLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRegistered(params.get("registered") === "true");
      setReset(params.get("reset") === "true");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error(err);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error(err);
    }
  };

  const handleFacebook = async () => {
    try {
      await loginWithFacebook();
    } catch (err) {
      setError("Facebook sign-in failed. Please try again.");
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
            "linear-gradient(135deg, oklch(0.38 0.13 240), oklch(0.45 0.14 210), oklch(0.52 0.15 162))",
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
            Welcome back to your learning journey
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Sign in to access your courses, track your progress, and connect
            with expert tutors.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[11, 47, 52, 33].map((n) => (
                <div
                  key={n}
                  className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20 overflow-hidden"
                >
                  <Image
                    src={`https://i.pravatar.cc/80?img=${n}`}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-white/80">
              <strong className="text-white">12,000+</strong> students learning
            </p>
          </div>
        </div>

        <p className="text-sm text-white/50">
          Â© {new Date().getFullYear()} Student Tutor Platform
        </p>
      </div>

      {/* Right panel â€” form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
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
              Sign in
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Status alerts */}
          {registered && (
            <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
              <AlertDescription>
                Registration successful! Please sign in with your credentials.
              </AlertDescription>
            </Alert>
          )}
          {reset && (
            <Alert className="border-primary/30 bg-primary/10 text-primary">
              <AlertDescription>
                Password reset link has been sent to your email.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="border-destructive/30 bg-destructive/10 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogle}
              className="h-11 gap-2 font-semibold"
            >
              <FaGoogle className="h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={handleFacebook}
              className="h-11 gap-2 font-semibold"
            >
              <FaFacebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <Link
                  href="/reset-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10"
                  required
                />
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-primary hover:underline"
              >
                Sign up free
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


