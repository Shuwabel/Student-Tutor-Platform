/**
 * Supabase query functions â€” replaces all legacy api/*.ts Axios calls
 */
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

// â”€â”€ TYPES â”€â”€
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  image_url: string | null;
  instructor_id: string;
  price: number;
  is_published: boolean;
  created_at: string;
  instructor?: { full_name: string; avatar_url: string };
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  course?: Course;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  course_id: string;
  instructor_id: string;
  meeting_link: string;
  scheduled_for: string;
  duration_minutes: number;
  status: string;
  max_attendees: number;
  instructor?: { full_name: string; avatar_url: string };
  course?: { title: string };
}

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  type: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
  time_limit_minutes: number | null;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  bio: string;
  is_demo: boolean;
}

// â”€â”€ COURSES â”€â”€
export async function getCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name, avatar_url)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Course[];
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Course;
}

export async function getCoursesByInstructor(instructorId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Course[];
}

export async function createCourse(course: Partial<Course>) {
  const { data, error } = await supabase
    .from("courses")
    .insert(course)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

// â”€â”€ MODULES â”€â”€
export async function getModulesByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data as Module[];
}

// â”€â”€ ENROLLMENTS â”€â”€
export async function getEnrollmentsByStudent(studentId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("student_id", studentId);

  if (error) throw error;
  return data as Enrollment[];
}

export async function enrollInCourse(studentId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single();

  if (error) throw error;
  return data as Enrollment;
}

export async function updateProgress(
  enrollmentId: string,
  progress: number
) {
  const { error } = await supabase
    .from("enrollments")
    .update({ progress })
    .eq("id", enrollmentId);

  if (error) throw error;
}

export async function getEnrollmentCountByCourse(courseId: string) {
  const { count, error } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  if (error) throw error;
  return count ?? 0;
}

// â”€â”€ LIVE CLASSES â”€â”€
export async function getLiveClasses() {
  const { data, error } = await supabase
    .from("live_classes")
    .select(
      "*, instructor:profiles!instructor_id(full_name, avatar_url), course:courses!course_id(title)"
    )
    .order("scheduled_for", { ascending: true });

  if (error) throw error;
  return data as LiveClass[];
}

export async function getLiveClassesByInstructor(instructorId: string) {
  const { data, error } = await supabase
    .from("live_classes")
    .select(
      "*, course:courses!course_id(title)"
    )
    .eq("instructor_id", instructorId)
    .order("scheduled_for", { ascending: true });

  if (error) throw error;
  return data as LiveClass[];
}

export async function createLiveClass(liveClass: Partial<LiveClass>) {
  const { data, error } = await supabase
    .from("live_classes")
    .insert(liveClass)
    .select()
    .single();

  if (error) throw error;
  return data as LiveClass;
}

export async function updateLiveClassStatus(id: string, status: string) {
  const { error } = await supabase
    .from("live_classes")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

// â”€â”€ ASSESSMENTS â”€â”€
export async function getAssessmentsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("course_id", courseId);

  if (error) throw error;
  return data as Assessment[];
}

export async function submitAssessment(
  assessmentId: string,
  studentId: string,
  answers: unknown[],
  score: number
) {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      assessment_id: assessmentId,
      student_id: studentId,
      answers,
      score,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// â”€â”€ PROFILES â”€â”€
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getTutors() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["tutor", "both"]);

  if (error) throw error;
  return data as Profile[];
}


