# Quiz Builder

Full-stack app for creating and managing quizzes.

- **backend/** — NestJS + Sequelize + PostgreSQL (REST API)
- **frontend/** — Next.js (pages router) + TypeScript, forms built with React Hook Form + Zod (schemas in `frontend/schemas/`)

## Features

- Create a quiz with a title and any number of questions
- Question types: **True/False**, **short text input**, **multiple choice (checkboxes)**
- List all quizzes (with question count), view a quiz, delete a quiz
- Register / log in (JWT); only logged-in users can create quizzes, and only the owner sees the delete icon

## Getting started

### Prerequisites

- **Node.js 18+** and npm (`node -v` to check)
- **PostgreSQL 14+** installed locally and running on `localhost:5432` (`psql --version` to check)

You will need **two terminals**, opened in the project root: one for the backend and one for the frontend.

### Step-by-step

**1. Create the database**

Make sure the PostgreSQL service is running, then create an empty database:

```bash
psql -U postgres -c "CREATE DATABASE quiz_builder;"
```

(or create it in pgAdmin / DBeaver). Use any name you like, it just has to match `DB_NAME` in step 3.

**2. Install dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
```

**3. Configure environment variables**

```bash
# from the project root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

On Windows PowerShell use `Copy-Item backend/.env.example backend/.env` and `Copy-Item frontend/.env.example frontend/.env.local`.

Open `backend/.env` and set `DB_USER`, `DB_PASSWORD` and `DB_NAME` to your local PostgreSQL credentials and the database from step 1. Change `JWT_SECRET` in `backend/.env` to any long random string. `.env` files are git-ignored; only the `.env.example` templates are committed.

| File | Variable | Default | Purpose |
| ---- | -------- | ------- | ------- |
| `backend/.env` | `PORT` | `4000` | API port |
| | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `localhost`, `5432`, `postgres`, `postgres`, `quiz_builder` (change to yours) | PostgreSQL connection |
| | `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin allowed by CORS |
| | `JWT_SECRET`, `JWT_EXPIRES_IN` | - , `1d` | Token signing |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend base URL |

**4. Create the tables** (in `backend/`)

```bash
npm run migrate
```

**5. Create a sample quiz** (in `backend/`, optional)

```bash
npm run seed
```

Creates the user `demo@example.com` / `password123` and a quiz "JavaScript Basics". Running it again adds one more copy of the quiz. You can also skip this and create a quiz in the UI (see below).

**6. Start the backend** (in `backend/`, keep this terminal open)

```bash
npm run start:dev
```

API: http://localhost:4000, Swagger docs: http://localhost:4000/api

**7. Start the frontend** (new terminal, in `frontend/`)

```bash
npm run dev
```

App: http://localhost:3000 (redirects to `/quizzes`).

### Using the app

1. Open http://localhost:3000/login and sign in as `demo@example.com` / `password123` (or register a new account at `/register`).
2. **Create a sample quiz manually:** click **Create quiz**, enter a title, add questions (True/False, short text, or multiple choice with several correct options), then **Create quiz**.
3. **Quizzes** lists every quiz; click one to open it. The pencil icon edits and the trash icon deletes quizzes you own (also available as **Edit quiz** on the quiz page).
4. Logged-in users can answer the questions and press **Submit answers**; guests get a login prompt when they try to answer.
5. Click your name in the top bar to open your profile with stats and the history of quizzes you took.

### Everyday commands

| Where | Command | What it does |
| ----- | ------- | ------------ |
| `backend/` | `npm run start:dev` | API with auto-reload |
| `backend/` | `npm run build` | Compile to `dist/` |
| `backend/` | `npm run migrate` / `migrate:undo` | Apply / roll back the last migration |
| `backend/` | `npm run seed` | Demo user and sample quiz |
| `frontend/` | `npm run dev` | Dev server on port 3000 |
| `frontend/` | `npm run build && npm start` | Production build and server |
| both | `npm run lint`, `npm run format`, `npm run typecheck` | ESLint, Prettier, TypeScript check |

To stop the app press `Ctrl+C` in the backend and frontend terminals.

### Troubleshooting

- **"Failed to fetch" in the browser**: the backend is not running or `NEXT_PUBLIC_API_URL` is wrong. Open http://localhost:4000/quizzes; it should return JSON. Restart `npm run dev` after editing `frontend/.env.local`.
- **`password authentication failed` / cannot connect to the database**: check that PostgreSQL is running and that `DB_*` in `backend/.env` match your local credentials and an existing database.
- **`relation "quizzes" does not exist`**: run `npm run migrate` in `backend/`.
- **Port already in use**: change `PORT` in `backend/.env` (and `NEXT_PUBLIC_API_URL` to match), or free port 3000/4000/5432.

Schema is managed by Sequelize migrations in `backend/db/migrations`.

### Pages

| Page | Description |
| ---- | ----------- |
| `/quizzes` | Quiz list with question count, links to details, trash icon to delete your own quizzes |
| `/quizzes/:id` | Quiz details; logged-in users can answer and submit, guests are asked to log in |
| `/quizzes/:id/edit` | Edit your own quiz: change the title, edit, add or remove questions and answers |
| `/create` | Quiz builder (login required): dynamic questions, correct answer per type |
| `/profile`, `/profile/attempts/:id` | Your stats, quizzes and history of attempts |
| `/login`, `/register` | Auth |

### Code quality

ESLint and Prettier are configured in both `backend/` and `frontend/`:

```bash
npm run lint          # ESLint
npm run format        # Prettier --write (format:check only verifies)
npm run typecheck     # tsc --noEmit
```

## API

Interactive Swagger docs: http://localhost:4000/api (OpenAPI JSON at `/api-json`).

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/register` | - | Register (`name`, `email`, `password` min 8), returns a JWT |
| POST | `/auth/login` | - | Log in (`email`, `password`), returns a JWT |
| GET | `/auth/me` | yes | Current user |
| GET | `/users`, `/users/:id` | - | List / get users |
| POST | `/quizzes` | yes | Create a quiz owned by the token's user |
| GET | `/quizzes` | - | List quizzes (`id`, `userId`, `title`, `questionCount`); filter with `?userId=` |
| GET | `/quizzes/:id` | - | Quiz with all questions (correct answers are never returned) |
| GET | `/quizzes/:id/edit` | yes | Your own quiz including correct answers (403 for someone else's) |
| PUT | `/quizzes/:id` | yes | Replace title and questions of your own quiz (same payload as create) |
| DELETE | `/quizzes/:id` | yes | Delete your own quiz (403 for someone else's) |
| POST | `/quizzes/:id/attempts` | yes | Submit answers, returns the graded attempt |
| GET | `/profile` | yes | Profile with stats (quizzes created, attempts, average score) |
| GET | `/profile/quizzes` | yes | Quizzes you created |
| GET | `/profile/attempts` | yes | History of quizzes you took, newest first |
| GET | `/profile/attempts/:id` | yes | One attempt with per-question results |

Protected endpoints need `Authorization: Bearer <token>`. Users register via `/auth/register`; the seed creates `demo@example.com` / `password123`. Set `JWT_SECRET` in `backend/.env` (see `.env.example`).

Create-quiz payload (each question needs a `correctAnswer`: boolean for `boolean`, string for `input`, list of options for `checkbox`):

```json
{
  "title": "JavaScript Basics",
  "questions": [
    { "text": "JS is statically typed.", "type": "boolean", "correctAnswer": false },
    { "text": "Keyword for block-scoped variables?", "type": "input", "correctAnswer": "let" },
    { "text": "Primitive types?", "type": "checkbox", "options": ["string", "object", "number"], "correctAnswer": ["string", "number"] }
  ]
}
```

## Structure

```
backend/src/quizzes/   models, DTOs, service, controller, module
backend/src/auth/      register / login (JWT)
backend/src/attempts/  submit and grade quiz attempts
backend/src/profile/   profile, stats, attempts history
backend/db/migrations/ Sequelize migrations
frontend/pages/        /quizzes, /quizzes/[id], /create, /login, /register, /profile
frontend/components/   QuizForm, QuestionEditor, QuizCard, AuthForm, Nav, ...
frontend/services/     API client
```

Submit-attempt payload (`POST /quizzes/:id/attempts`): `{ "answers": [{ "questionId": 1, "answer": false }, { "questionId": 2, "answer": "let" }] }`. Unanswered questions count as wrong; questions created before grading existed have no correct answer and are not scored.
