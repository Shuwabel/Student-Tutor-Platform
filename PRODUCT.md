# Product

## Platform

web

## Users
Three roles (given: student, tutor and admin portals). Students (secondary school to early university, inferred) who want to learn a subject, practise with quizzes and show what they finished. Tutors who publish courses, set quizzes and assignments, grade work and run live classes. An admin who oversees users and content.

## Product Purpose
A learning platform where a student finds a course, works through lessons, tests themselves with quizzes, hands in assignments, joins live classes, downloads study materials, and earns a verifiable certificate; and where a tutor can create and run all of that. (Given from routes: courses, assessments, assignments, certificates, live classes, study materials, career tools.) Success is a student who finishes a course and can prove it.

## Positioning
A complete, free, no-account-server learning platform for a portfolio demo: every role and every flow works end to end in the browser with seeded sample content, and live classes use free public video rooms. (Inferred from the launch goal.)

## Operating Context
Used daily by students on a phone or laptop in short sessions (a lesson, a quiz) and by tutors on a laptop for authoring. All data is stored in the browser (localStorage) with sample data seeded on first visit; there is no real login and no backend. (Decision: the previous Supabase and Express-API dependencies were not deployable without keys and a server.)

## Capabilities and Constraints
- Next.js App Router, React, TypeScript, Tailwind, zustand. Deploys to Vercel as a static-first app. No API keys, no environment variables.
- Demo accounts per role plus local sign-up; role switch is part of the demo.
- Features: course catalog, enrol, lesson player with progress, quizzes with scoring and history, assignments with submissions and grading, certificates with public verification link (certificate data travels in the link), live classes via Jitsi public rooms, study materials, career opportunities and resume builder with PDF export, tutor course authoring, admin overview.
- Not included: real payments, real email, realtime chat, user-uploaded files (links only).

## Brand Commitments
Name: Student Tutor Platform. No logo or voice rules were given. (Given: name.)

## Evidence on Hand
No real students, tutors, ratings, completion numbers or testimonials exist. The previous landing page showed invented figures (12,000 students, 98% satisfaction, 500 tutors); these must not return. Sample courses, tutors and learners are clearly sample data.

## Product Principles
- Every role can finish its job: nothing in the navigation leads to a dead page.
- Progress is always visible: where am I in this course, what is due, what did I score.
- Honest: sample data is labelled as sample, certificates verify against what they carry, no invented numbers.
- Works on a phone: lessons, quizzes and assignment hand-in are comfortable with a thumb.

## Accessibility & Inclusion
Quizzes and lessons must be keyboard operable with visible focus; text sizes comfortable for long reading; reduced-motion respected.
