-- ============================================================
-- Student Tutor Platform MVP â€” Supabase Schema
-- Run this in Supabase Dashboard â†’ SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'student' check (role in ('student', 'tutor', 'both', 'admin')),
  avatar_url text,
  bio text default '',
  is_demo boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. COURSES TABLE
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  category text default 'General',
  level text default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  image_url text,
  instructor_id uuid references public.profiles(id) on delete set null,
  price numeric(10,2) default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. MODULES TABLE
create table if not exists public.modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  content text default '',
  "order" integer default 0,
  created_at timestamptz default now()
);

-- 4. ENROLLMENTS TABLE
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);

-- 5. LIVE CLASSES TABLE
create table if not exists public.live_classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  course_id uuid references public.courses(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete set null,
  meeting_link text default '',
  scheduled_for timestamptz not null,
  duration_minutes integer default 60,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'completed', 'cancelled')),
  max_attendees integer default 50,
  created_at timestamptz default now()
);

-- 6. ASSESSMENTS TABLE
create table if not exists public.assessments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  type text default 'quiz' check (type in ('quiz', 'exam')),
  questions jsonb default '[]'::jsonb,
  time_limit_minutes integer,
  created_at timestamptz default now()
);

-- 7. SUBMISSIONS TABLE
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  answers jsonb default '[]'::jsonb,
  score numeric(5,2),
  submitted_at timestamptz default now(),
  unique(assessment_id, student_id)
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.enrollments enable row level security;
alter table public.live_classes enable row level security;
alter table public.assessments enable row level security;
alter table public.submissions enable row level security;

-- PROFILES: Users can read all profiles, update only their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- COURSES: Anyone can read published courses, tutors can manage their own
create policy "Published courses are viewable" on public.courses for select using (is_published = true or instructor_id = auth.uid());
create policy "Tutors can insert courses" on public.courses for insert with check (instructor_id = auth.uid());
create policy "Tutors can update own courses" on public.courses for update using (instructor_id = auth.uid());
create policy "Tutors can delete own courses" on public.courses for delete using (instructor_id = auth.uid());

-- MODULES: Readable if you can see the course, writable by instructor
create policy "Modules are viewable" on public.modules for select using (true);
create policy "Instructors can manage modules" on public.modules for insert with check (
  exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);
create policy "Instructors can update modules" on public.modules for update using (
  exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);
create policy "Instructors can delete modules" on public.modules for delete using (
  exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);

-- ENROLLMENTS: Students see their own, tutors see enrollments in their courses
create policy "Students see own enrollments" on public.enrollments for select using (student_id = auth.uid());
create policy "Students can enroll" on public.enrollments for insert with check (student_id = auth.uid());
create policy "Tutors see enrollments in their courses" on public.enrollments for select using (
  exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);

-- LIVE CLASSES: Viewable by all authenticated, manageable by instructor
create policy "Live classes are viewable" on public.live_classes for select using (true);
create policy "Instructors can manage live classes" on public.live_classes for insert with check (instructor_id = auth.uid());
create policy "Instructors can update live classes" on public.live_classes for update using (instructor_id = auth.uid());

-- ASSESSMENTS: Viewable by enrolled students and course instructor
create policy "Assessments are viewable" on public.assessments for select using (true);
create policy "Instructors can manage assessments" on public.assessments for insert with check (
  exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);

-- SUBMISSIONS: Students see own, tutors see submissions in their courses
create policy "Students see own submissions" on public.submissions for select using (student_id = auth.uid());
create policy "Students can submit" on public.submissions for insert with check (student_id = auth.uid());
create policy "Tutors see submissions in their courses" on public.submissions for select using (
  exists (
    select 1 from public.assessments a
    join public.courses c on c.id = a.course_id
    where a.id = assessment_id and c.instructor_id = auth.uid()
  )
);


