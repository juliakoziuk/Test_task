# Quiz Builder

Full-stack app for creating and managing quizzes.

- **backend/** — NestJS + Sequelize + PostgreSQL (REST API)
- **frontend/** — Next.js (pages router) + TypeScript

## Features

- Create a quiz with a title and any number of questions
- Question types: **True/False**, **short text input**, **multiple choice (checkboxes)**
- List all quizzes (with question count), view a quiz, delete a quiz

## Running locally

Requirements: Node 18+, Docker (or any PostgreSQL instance).

```bash
# 1. Database
docker compose up -d

# 2. Backend (http://localhost:4000)
cd backend
cp .env.example .env
npm install
npm run migrate     # create tables
npm run seed        # optional: sample quiz
npm run start:dev

# 3. Frontend (http://localhost:3000)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Schema is managed by Sequelize migrations in `backend/db/migrations` (`npm run migrate`, `npm run migrate:undo` to roll back the last one).

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
frontend/pages/        /quizzes, /quizzes/[id], /create
frontend/components/   QuizForm, QuestionEditor, QuizCard
frontend/services/     API client
```

Submit-attempt payload (`POST /quizzes/:id/attempts`): `{ "answers": [{ "questionId": 1, "answer": false }, { "questionId": 2, "answer": "let" }] }`. Unanswered questions count as wrong; questions created before grading existed have no correct answer and are not scored.
