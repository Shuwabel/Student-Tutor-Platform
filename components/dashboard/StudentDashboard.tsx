"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getEnrollmentsByStudent,
  getLiveClasses,
  type Enrollment,
  type LiveClass,
} from "@/lib/supabase-queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  TrendingUp,
  Video,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [enr, classes] = await Promise.all([
          getEnrollmentsByStudent(user.id),
          getLiveClasses(),
        ]);
        setEnrollments(enr);
        setLiveClasses(
          classes.filter(
            (c) => c.status === "scheduled" || c.status === "live"
          )
        );
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
          enrollments.length
      )
    : 0;

  const completedCourses = enrollments.filter(
    (e) => e.progress === 100
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
      {/* Demo banner */}
      {user.is_demo && (
        <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/10 px-5 py-3">
          <p className="text-sm font-semibold text-secondary">
            ðŸŽ“ You are viewing Student Tutor Platform in demo mode
          </p>
          <Link
            href="/register"
            className="text-sm font-bold text-secondary hover:underline"
          >
            Sign up for free â†’
          </Link>
        </div>
      )}

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {user.full_name || "Student"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your learning progress at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Enrolled Courses",
            value: enrollments.length,
            icon: <BookOpen className="h-5 w-5" />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Avg Progress",
            value: `${avgProgress}%`,
            icon: <TrendingUp className="h-5 w-5" />,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
          {
            label: "Completed",
            value: completedCourses,
            icon: <GraduationCap className="h-5 w-5" />,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
          {
            label: "Upcoming Classes",
            value: liveClasses.length,
            icon: <Video className="h-5 w-5" />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* My Courses â€” takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Courses</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">
                Browse catalog
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  You haven&apos;t enrolled in any courses yet.
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => (
                <Card key={enr.id} className="overflow-hidden">
                  <div className="flex items-center gap-5 p-5">
                    {/* Course image */}
                    <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {enr.course?.image_url ? (
                        <img
                          src={enr.course.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">
                        {enr.course?.title || "Untitled Course"}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {enr.course?.level || "Beginner"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {enr.course?.category || "General"}
                        </Badge>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${enr.progress}%`,
                              background:
                                enr.progress === 100
                                  ? "oklch(0.52 0.15 162)"
                                  : "oklch(0.38 0.13 240)",
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground w-10 text-right">
                          {enr.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/courses/${enr.course_id}`}>
                        Continue
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Live Classes â€” sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Upcoming Classes</h2>

          {liveClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10">
                <Video className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                  No upcoming live classes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveClasses.slice(0, 4).map((lc) => (
                <Card key={lc.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">
                        {lc.title}
                      </CardTitle>
                      <Badge
                        className={
                          lc.status === "live"
                            ? "bg-secondary text-secondary-foreground"
                            : ""
                        }
                        variant={
                          lc.status === "live" ? "default" : "outline"
                        }
                      >
                        {lc.status === "live" ? "Live Now" : "Scheduled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(lc.scheduled_for).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(lc.scheduled_for).toLocaleTimeString(
                          undefined,
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </div>
                    {lc.meeting_link && (
                      <Button asChild size="sm" className="w-full gap-1">
                        <a
                          href={lc.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Session
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


