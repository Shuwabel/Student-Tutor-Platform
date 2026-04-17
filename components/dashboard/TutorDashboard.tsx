"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getCoursesByInstructor,
  getLiveClassesByInstructor,
  type Course,
  type LiveClass,
} from "@/lib/supabase-queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  Clock,
  PlusCircle,
  Video,
  ArrowRight,
  Play,
} from "lucide-react";

export function TutorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [c, lc] = await Promise.all([
          getCoursesByInstructor(user.id),
          getLiveClassesByInstructor(user.id),
        ]);
        setCourses(c);
        setLiveClasses(lc);
      } catch (err) {
        console.error("Tutor dashboard fetch error:", err);
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

  const upcomingClasses = liveClasses.filter(
    (c) => c.status === "scheduled" || c.status === "live"
  );
  const publishedCourses = courses.filter((c) => c.is_published);

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

      {/* Welcome + actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user.full_name || "Tutor"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your teaching today.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Published Courses",
            value: publishedCourses.length,
            icon: <BookOpen className="h-5 w-5" />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Total Courses",
            value: courses.length,
            icon: <BookOpen className="h-5 w-5" />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Upcoming Classes",
            value: upcomingClasses.length,
            icon: <Video className="h-5 w-5" />,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
          {
            label: "Total Sessions",
            value: liveClasses.length,
            icon: <Calendar className="h-5 w-5" />,
            color: "text-secondary",
            bg: "bg-secondary/10",
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
        {/* Courses â€” 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Courses</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/courses/create">
                <PlusCircle className="mr-1 h-4 w-4" />
                New Course
              </Link>
            </Button>
          </div>

          {courses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  You haven&apos;t created any courses yet.
                </p>
                <Button asChild>
                  <Link href="/courses/create">Create Your First Course</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="flex items-center gap-5 p-5">
                    {/* Course image */}
                    <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {course.image_url ? (
                        <Image
                          src={course.image_url}
                          alt=""
                          width={112}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate">{course.title}</h3>
                        <Badge
                          variant={
                            course.is_published ? "default" : "outline"
                          }
                          className="shrink-0 text-xs"
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {course.description}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        {course.price > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ${course.price}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/courses/${course.id}`}>
                        Manage
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Live Classes sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Live Classes</h2>

          {liveClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10">
                <Video className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                  No live classes scheduled
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveClasses.slice(0, 5).map((lc) => (
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
                            : lc.status === "completed"
                            ? "bg-muted text-muted-foreground"
                            : ""
                        }
                        variant={
                          lc.status === "live"
                            ? "default"
                            : lc.status === "completed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {lc.status === "live"
                          ? "Live Now"
                          : lc.status === "completed"
                          ? "Completed"
                          : "Scheduled"}
                      </Badge>
                    </div>
                    {lc.course && (
                      <CardDescription>{lc.course.title}</CardDescription>
                    )}
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
                        {lc.duration_minutes} min
                      </div>
                    </div>
                    {lc.status === "scheduled" && lc.meeting_link && (
                      <Button asChild size="sm" className="w-full gap-1">
                        <a
                          href={lc.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Start Session
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


