# Student Tutor Platform

Student Tutor Platform is a demo education platform with student, tutor, and admin portals. The repository is now flattened at the root, so the app runs directly from this folder.

## Stack

- Next.js 15
- TypeScript
- Supabase for auth, data, and storage
- Tailwind CSS v4
- Radix UI and shadcn-style components
- React Hook Form and Zod
- TanStack Query
- Socket.IO client for realtime demo interactions

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your local environment file

Create a `.env.local` file in the repository root with the values required by your Supabase project and any other local demo configuration.

Typical variables include:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If you later add more services, keep them in this file as well.

### 3. Run the app locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Build for production

```bash
npm run build
```

### 5. Start the production build

```bash
npm run start
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Shared UI and feature components
- `lib/` - Utilities, API helpers, and Supabase clients
- `supabase/` - Local schema and seed SQL
- `context/`, `hooks/`, `providers/`, `services/`, `types/`, `utils/` - app support code

## Notes

- `PRD.md` is intentionally ignored from Git history.
- `docs/` is ignored from Git history.
- The MVP is intended to stay Supabase-first for now rather than introducing a separate custom API server.
