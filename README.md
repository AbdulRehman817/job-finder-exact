# Jobpilot

Jobpilot is a modern job marketplace for candidates and recruiters.

## Quick Start
1. Install dependencies:
   npm install
2. Run the dev server on port 3000:
   npm run dev -- --port 3000

## Environment (Frontend)
Set the following in `job-finder-exact/.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Backend (Supabase)
This project uses Supabase (Postgres + Auth + Storage) as the backend.
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. Create a storage bucket named `resumes` and set it to **Public**.
4. Run the SQL in `supabase/storage.sql` to allow authenticated users to manage their own resumes.

## Scripts
- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm run preview` - preview the production build
