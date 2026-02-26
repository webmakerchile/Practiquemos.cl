# Practiquemos.cl

## Overview

Practiquemos.cl is a mobile-first exam preparation platform for the Chilean driver's license test. It provides practice exams, study materials (temario), progress tracking, and a gamified learning experience with a mascot "copiloto" companion. The app follows a freemium model with free limited exams and premium plans (10-day and 30-day access).

The project is built as an Expo React Native application that runs on web, iOS, and Android, with a Node.js/Express backend API and PostgreSQL database. The frontend uses expo-router for file-based routing, and the backend serves the API plus static assets in production.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, targeting web, iOS, and Android from a single codebase.
- **Routing**: expo-router (file-based routing). All screens are in the `app/` directory as flat files (no tab navigation — uses a Stack navigator with `headerShown: false`).
- **State Management**: React Context (`lib/UserContext.tsx`) for user authentication state. TanStack React Query (`@tanstack/react-query`) for server data fetching.
- **Styling**: React Native `StyleSheet` objects (not Tailwind). The design system uses a custom color palette defined in `constants/colors.ts` — blue primary (#1d4ed8), amber accent (#f59e0b), slate neutrals.
- **Fonts**: Nunito (Google Fonts via `@expo-google-fonts/nunito`) in Regular, SemiBold, Bold, and ExtraBold weights.
- **Animations**: `react-native-reanimated` for the mascot copilot component animations.
- **TTS**: `expo-speech` reads questions, options, and explanations aloud in Spanish (es-419 locale). Humanized voice (rate 0.85, pitch 1.05) with natural pauses after punctuation. Speaker buttons on exam questions, explanations, and temario sections.
- **Audio**: `expo-av` plays correct/incorrect WAV sound effects stored in `assets/sounds/`. 3 variations each for correct and incorrect, randomly selected for variety.
- **Answer Shuffle**: Options are shuffled at exam start so correct answers are randomly distributed across A/B/C/D (original data had 83% B bias).
- **Key UX Pattern**: The mascot "copiloto" (`components/MascotaCopiloto.tsx`) provides positive reinforcement with dopamine-driven animations. No harsh red colors for errors — uses orange/amber tones. Streak badges for consecutive correct answers.
- **Mascot Logos**: 5 real PNG images in `assets/images/`:
  - `logo-completo.png` → Branding in home header and login screen
  - `mascota-cabeza.png` → Avatar in profile (perfil) screen
  - `mascota-cuerpo.png` → Idle/correct/celebrate states in exam
  - `mascota-hablando.png` → When TTS is active (speaking state) + register step 2
  - `mascota-pensando.png` → When user is answering (thinking/incorrect state) + register step 3, exit modal
- **Question Images**: `lib/questionImages.ts` provides a smart keyword-based image resolver with 68 local PNG images in `assets/images/questions/`. All 1005 questions have specific keyword-matched illustrations (100% coverage). Images also used in temario sections via keyword matching.
- **Custom Icons**: Home menu uses emoji-based custom icons (View+Text) instead of generic library icons for unique brand identity.
- **Text Justify**: Body text throughout the app uses `textAlign: 'justify'` for a clean, professional look.
- **License Types**: 6 types supported — Clase B (blue), A2 (purple), A4 (orange), C (green), D (amber), E (red).

### Screen Structure

| Screen | Purpose |
|--------|---------|
| `index` | Home/main menu with exam mode selection and license type picker |
| `login` / `register` | Authentication screens |
| `exam` | Exam engine with timer, question navigation, learning mode |
| `results` | Post-exam results with category breakdown |
| `history` | Past exam results list |
| `temario` / `temario-detail` | Study material chapters and sections |
| `mi-curso` | Progress tracking per category |
| `favoritos` | Saved/bookmarked questions |
| `plans` | Premium subscription plans display |
| `perfil` | User profile and settings |
| `admin` | Admin panel for user management |
| `contacto` / `nosotros` | Static info pages |

### Backend (Express.js)

- **Runtime**: Node.js with Express 5, written in TypeScript, compiled with `tsx` (dev) or `esbuild` (prod).
- **Entry point**: `server/index.ts` — sets up CORS, JSON parsing, routes, and static file serving.
- **Routes**: `server/routes.ts` — RESTful API with auth middleware. Uses in-memory session tokens (Map-based, not JWT persistence).
- **Authentication**: SHA-256 password hashing (via Node's `crypto`). Bearer token sessions stored in-memory on the server. Tokens are stored client-side in AsyncStorage.
- **Storage layer**: `server/storage.ts` — `DatabaseStorage` class implementing `IStorage` interface with Drizzle ORM queries. This abstraction makes swapping storage implementations straightforward.

### API Structure

- `POST /api/auth/login` — Login with username/password, returns bearer token
- `POST /api/auth/register` — Create new user account
- `GET /api/exam-results` — Get user's exam history
- `POST /api/exam-results` — Save exam result
- `GET /api/favorites/:licenseType` — Get favorited question IDs
- `POST /api/favorites` / `DELETE /api/favorites/:id/:licenseType` — Manage favorites
- `GET /api/progress/:licenseType` — Get category progress
- `GET /api/admin/users` — Admin: list all users
- `POST /api/admin/users` — Admin: create user
- `PUT /api/admin/users/:id` — Admin: update user
- `DELETE /api/admin/users/:id` — Admin: delete user

### Database (PostgreSQL + Drizzle ORM)

- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Schema**: Defined in `shared/schema.ts` with validation schemas via `drizzle-zod`.
- **Tables**:
  - `users` — id (UUID), username (unique), password (hashed), email, fullName, role, plan, planExpiry, licenseType, timestamps
  - `exam_results` — id, userId (FK), examMode, licenseType, scores, passed, timeSpent, categoryBreakdown (JSONB)
  - `favorites` — id, userId (FK), questionId, licenseType
  - `category_progress` — id, userId, licenseType, category, progress tracking
- **Migrations**: Generated via `drizzle-kit` to `./migrations/` directory. Push with `npm run db:push`.

### Question Data

Questions are stored client-side across multiple files and combined in `lib/mockDatabase.ts`:
- `lib/questionsData.ts` — Base 235 questions (IDs 1-235)
- `lib/questions-part2.ts` — 150 questions: Ley de Tránsito + Señalización (IDs 236-385)
- `lib/questions-part3.ts` — 150 questions: Mecánica Básica + Primeros Auxilios (IDs 386-535)
- `lib/questions-part4.ts` — 150 questions: Conducción Segura + Defensiva + Medio Ambiente (IDs 536-685)
- `lib/questions-part5.ts` — 120 questions: Advanced scenarios + specific signals (IDs 686-805)
- `lib/questions-part6.ts` — 100 questions: Real exam mechanics, distances, safety (IDs 806-905)
- `lib/questions-part7.ts` — 100 questions: Signals detail, speeds, pedestrians, alcohol, accidents (IDs 906-1005)

Total: 1005 questions across 10 categories, covering all Chilean driving exam topics.
Study materials in `lib/temarioData.ts` with 6 chapters, 83 sections. The exam engine (`app/exam.tsx`) pulls from this local data and supports multiple exam modes: daily, easy, hard, category-specific, and smart (randomized).

### Build & Deployment

- **Dev**: Two processes — `expo:dev` (Expo Metro bundler) and `server:dev` (Express API with tsx).
- **Production**: Expo static web build (`expo:static:build`) + esbuild for server (`server:build`), served by `server:prod`.
- **Build script**: `scripts/build.js` handles the static export process, starting Metro, fetching bundles, and writing to disk.
- **Environment**: `EXPO_PUBLIC_DOMAIN` connects the mobile app to the API server. `DATABASE_URL` for PostgreSQL.

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, connected via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) driver with Drizzle ORM.

### Key NPM Packages
- `expo` (SDK 54) — Cross-platform framework
- `expo-router` — File-based navigation
- `@tanstack/react-query` — Server state management
- `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
- `express` v5 — API server
- `react-native-reanimated` — Animations
- `react-native-gesture-handler` — Touch handling
- `@react-native-async-storage/async-storage` — Client-side token persistence
- `expo-linear-gradient` — Gradient headers throughout the app
- `@expo-google-fonts/nunito` — Typography
- `expo-speech` — Text-to-speech (reads questions aloud in Spanish)
- `expo-av` — Audio playback for correct/incorrect sound effects

### External Services
- No third-party auth providers (custom username/password auth)
- No payment processing yet (plans page is display-only)
- No external analytics or crash reporting
- Contact links to email (contacto@practiquemos.cl), WhatsApp, and Instagram