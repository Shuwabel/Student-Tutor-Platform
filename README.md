# Student Tutor Platform

A complete learning platform for three roles: students, tutors and admins. Courses, lessons, quizzes, assignments, live classes, study materials, certificates and career tools all work end to end. No backend, no accounts to set up, no API keys or environment variables: everything runs in the browser, with sample content seeded on first visit.

The design is a library card catalogue: a course is a catalogue card with a call number, finishing something presses a date stamp, and certificates are stamped sheets.

## Try it

Open the app and choose **Continue as Student / Tutor / Admin**, or create your own account (no password; it lives in your browser only). Use the account menu to switch role or reset the sample data.

## What each role can do

- **Student**: browse and enrol in courses, work through lessons with saved progress, take timed quizzes, hand in assignments, join live classes, read study materials, earn certificates, browse opportunities and build a resume (PDF export).
- **Tutor**: create, edit and publish courses (modules and lessons), set quizzes and assignments, grade submissions with feedback, schedule live classes and add materials.
- **Admin**: see platform counts, manage people and roles, publish or remove courses.

## How it works without a server

- State lives in a zustand store persisted to `localStorage` (`student-tutor:v1`). Sample people, courses, quizzes, assignments and classes are built in `lib/seed.ts` from `data/seed/*.json`.
- Live classes open free public Jitsi rooms (`meet.jit.si`); anyone with the room name can join, so share nothing private.
- Certificates verify without a server: the certificate and a check code travel in the link (`/verify/<token>`). That proves the link was not altered, not that an institution issued it, and the page says so.
- Course videos are YouTube embeds and study materials are external links.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Structure

- `app/`: routes (each signed-in page is wrapped in `AppShell`)
- `components/`: shell, catalogue components (cards, stamps), feature components
- `lib/`: types, store, seed, selectors, certificate encoding
- `data/seed/`: sample course, quiz, assignment, material and opportunity content

## Deploy

Import the repository on Vercel. No environment variables are needed.
