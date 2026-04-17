# Student Tutor Platform

Student Tutor Platform is a demo education website built around four experiences:

- A public marketing site for visitors
- A student portal for learning and progress tracking
- A tutor portal for course and teaching management
- An admin portal for oversight and moderation

It also includes a public certificate verification page so third parties can confirm a credential.

## How The Product Works

### Public Website

The public site is the entry point for new visitors. It explains the product, shows the value for students and tutors, and routes people toward sign up or demo access.

A visitor can:

- Read the product overview on the homepage
- Register for a new account
- Log in to an existing account
- Use the demo entry point to explore the app as a student, tutor, or both
- Reset a forgotten password

After login, the app sends the user to the correct dashboard based on their role.

### Student Portal

The student portal is where a learner discovers courses, enrolls, studies, and tracks progress.

The student can:

- View a dashboard summary of active courses, progress, upcoming classes, and recent activity
- Browse the course catalog
- Open a course to read the overview, curriculum, instructor details, and progress state
- Enroll in a course
- Move through lessons and mark learning progress
- Join live classes and view recordings
- Take quizzes and exams
- Submit assignments and resubmit before the deadline
- See assignment scores, quiz results, and exam results
- Review certificates after completion
- Verify a certificate through a public verification page
- Use the career area to build a resume

The final grade for a course is based on the weighted components defined in the product: assignments, quizzes, and exams.

### Tutor Portal

The tutor portal is where an instructor creates and manages the learning experience.

The tutor can:

- View a dashboard summary of courses, learners, and teaching activity
- Create and edit courses
- Organize lesson content
- Upload or attach learning resources
- Create quizzes, exams, and assignments
- Set deadlines and grading rules
- Review assignment submissions and enter a numeric score
- Schedule and manage live classes
- Monitor student participation and course progress

Tutors are responsible for publishing the learning content that students consume in the portal.

### Admin Portal

The admin portal is for operational control of the platform.

The admin can:

- View users and search the roster
- Add or remove users
- View courses in the catalog
- Feature or unfeature courses
- Review operational data from a dashboard summary
- Access placeholders for future moderation and settings controls

This area is meant for internal oversight, not for student-facing learning.

### Certificate Verification Page

The verification page is public and does not require a logged-in account.

A third party can:

- Open a certificate verification link
- Check whether the credential is valid
- See the certificate holder, course, issue date, and status

## Stack

- Next.js 15
- TypeScript
- Supabase for auth, data, and storage
- Tailwind CSS v4
- Radix UI and shadcn-style components
- React Hook Form and Zod
- TanStack Query
- Socket.IO client for realtime demo interactions
- `date-fns` for deadlines and scheduling
- `html-to-image` and `jspdf` for export flows

## Local Development

### Install dependencies

```bash
npm install
```

### Create environment variables

Create a `.env.local` file in the repository root and add the values required by your Supabase project.

Typical variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build and start production mode

```bash
npm run build
npm run start
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Shared UI and feature components
- `lib/` - Utilities, API helpers, and Supabase clients
- `supabase/` - Local schema and seed SQL
- `context/`, `hooks/`, `providers/`, `services/`, `types/`, `utils/` - app support code

## Repository Rules

- `PRD.md` is intentionally ignored from Git history.
- `docs/` is intentionally ignored from Git history.
- `.agents/` is intentionally ignored from Git history.
- The demo should stay Supabase-first for now rather than introducing a separate custom API server.
