SmartCoach  
A progressive web app (PWA) that helps personal trainers manage their athletes while keeping athletes motivated through progress visibility, gamification, and a healthy competitive spirit.
Live app: https://smartcoachpwa.netlify.app/ 
About
Built as a portfolio project to demonstrate full-stack product development with AI-assisted workflows. Designed in close collaboration with a real personal trainer to ensure the tool reflects actual training workflows.
Product decisions highlighted:
Motivation-first athlete UX (progress and achievements before anything else)
Finance info deliberately de-emphasized for athletes (membership as a subtle profile section)
Trainer-configurable badge system with system defaults
Phased roadmap; diet and AI features deliberately deferred to post-MVP
Author
Niloo Jamshidi Product Manager · Industrial Management · CS background
LinkedIn · GitHub
Features
Trainer side
Dashboard: daily session overview, athlete mood summary, calendar view
Athletes: roster management, streak tracking, expandable athlete profiles
Exercise library: create, edit, and delete exercises by type, target area, and location
Plans: build and assign weekly workout plans per athlete
Session logging: log completed exercises with sets, reps, weight and athlete mood
Finance: payment tracking with paid/unpaid status per athlete
Reminders: send session reminders to athletes directly from the dashboard
Athlete side
Profile: personal info, dark/light mode toggle, membership status (collapsed, non-intrusive)
Dashboard: streak counter, PRs highlighted, today's session at a glance
My plan: view assigned workout plan by day + full session history
Progress: body weight and muscle mass line charts over time, strength progress per exercise
Achievements: badges, milestones, streak tracking
Platform
Fully responsive, works on mobile, tablet, and desktop
Dark/light mode
Installable PWA: works offline, no app store needed
Row-level security: athletes only see their own data
RTL-ready architecture for Persian/Arabic support (Phase 2)

Tech stack
Layer
Technology
Frontend
React 18 + Vite
Styling
CSS variables, custom design system
Backend
Supabase (PostgreSQL)
Auth
Supabase Auth (email/password)
Hosting
Netlify (CI/CD from GitHub)
PWA
vite-plugin-pwa


Database schema
Profiles:  users (trainer + athlete roles)
Exercise: trainer's exercise library
Plan:  workout plans assigned to athletes
Plan_exercise:  exercises within a plan
Journal: session logs with mood, sets, reps, weight
Body: body measurements over time
Badge_definition_system + custom trainer badges
Athlete_badge: earned badges per athlete
Finance: payment records per athlete
Diet: scaffolded for Phase 2

Row-level security (RLS) is enforced on all tables;  trainers only see their own athletes, and athletes only see their own data.

Roadmap
Phase 1 — MVP ✅
Trainer and athlete dashboards
Exercise library, plan builder, session logging
Progress charts, badges, streaks
Finance tracking
PWA deployment
Phase 2 — In progress
Leaderboards among trainer's athletes
Diet module
Persian (RTL) language support
AI workout suggestions and trainer summaries
Phase 3 — Future
Community profiles (Duolingo-style social motivation)
Multi-trainer / gym owner admin role
Google login
Native app wrapper (Capacitor)

Local development
# Clone the repo
git clone https://github.com/niloofarjamshidi26/smartcoach.git
cd smartcoach

# Install dependencies
npm install
# Add environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key

# Start dev server
npm run dev

Environment variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


Screenshots
Trainer Dashboard:




Athlete Progress:


Athlete Achievements:
