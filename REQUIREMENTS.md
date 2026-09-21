# Requirements checklist

How this project maps to the "Quiz Builder" test assignment: what the assignment asked for, where it is implemented, where the implementation deliberately differs, and what was added on top.

## 1. Requirements from the assignment

### Backend

| Requirement | Status | Where |
| ----------- | ------ | ----- |
| Node.js with Nest.js | Done | `backend/src` |
| TypeScript | Done | `backend/tsconfig.json` |
| PostgreSQL via Sequelize | Done | `backend/src/**/models`, `backend/db/migrations` |
| `POST /quizzes` – create a quiz | Done (requires login, see section 2) | `backend/src/quizzes/quizzes.controller.ts` |
| `GET /quizzes` – list with title and number of questions | Done | same controller, `questionCount` field |
| `GET /quizzes/:id` – full details with all questions | Done | same controller |
| `DELETE /quizzes/:id` – delete a quiz | Done (owner only, see section 2) | same controller |

### Frontend

| Requirement | Status | Where |
| ----------- | ------ | ----- |
| React, TypeScript, Next.js | Done | `frontend/` (Next.js pages router) |
| Optional: React Hook Form, Zod | Done | `frontend/schemas/`, `QuizForm`, `AuthForm` |
| **`/create`**: quiz title and one or more questions | Done | `frontend/pages/create.tsx`, `components/QuizForm.tsx` |
| Question type **Boolean**: True/False radio buttons | Done | `components/QuestionEditor.tsx` |
| Question type **Input**: short text answer | Done | `components/QuestionEditor.tsx` |
| Question type **Checkbox**: multiple choice, several correct answers | Done | `components/QuestionEditor.tsx` |
| Add and remove questions dynamically | Done | `useFieldArray` in `QuizForm.tsx` |
| Submit the form to `POST /quizzes` | Done | `frontend/services/api.ts` |
| **`/quizzes`**: fetch from `GET /quizzes` | Done | `frontend/pages/quizzes/index.tsx` |
| Show quiz title and number of questions | Done | `components/QuizCard.tsx` |
| Each item links to the quiz details page | Done | `components/QuizCard.tsx` |
| Delete icon: removes the quiz via `DELETE /quizzes/:id` and from the page | Done (icon shown to the quiz owner) | `components/QuizCard.tsx`, `pages/quizzes/index.tsx` |
| **`/quizzes/:id`**: fetch from `GET /quizzes/:id`, show title and questions | Done | `frontend/pages/quizzes/[id]/index.tsx` |
| Questions rendered in read-only mode | Done for guests; logged-in users can answer (see section 2) | same page |

### Additional requirements

| Requirement | Status | Where |
| ----------- | ------ | ----- |
| Styling (any solution) | Done, plain CSS | `frontend/styles/globals.css` |
| Mobile responsiveness | Done | media queries in `globals.css`, flexible layouts |
| ESLint and Prettier set up | Done in both `backend/` and `frontend/` | `.eslintrc.json`, `.prettierrc.json` |
| All files linted and formatted | Done: `npm run lint`, `npm run format:check`, `npm run typecheck` pass in both packages | scripts in each `package.json` |
| `.env` for backend DB config and base URLs | Done | `backend/.env.example`, `frontend/.env.example` |
| `.env` files are not committed | Done: `.env` and `.env.*` are git-ignored, only `.env.example` is tracked | `.gitignore` |
| README: start frontend and backend | Done | `README.md`, "Getting started" |
| README: set up the database | Done | `README.md`, steps 1 and 4 |
| README: create a sample quiz | Done | `README.md`, step 5 and "Using the app" |

### Project structure and deliverables

| Requirement | Status | Where |
| ----------- | ------ | ----- |
| `/backend` with `src/` and models | Done | `backend/src`, models in `backend/src/*/models` |
| `/frontend` with `pages/`, `components/`, `services/` | Done | `frontend/` |
| `README.md` in the root | Done | `README.md` |
| Sample quiz or seed script (optional) | Done | `npm run seed` in `backend/` (`backend/src/seed.ts`) |
| Clean, readable, modular code | Done: one module per domain on the backend, small components and a separate API client on the frontend | |
| GitHub repo with `/frontend` and `/backend` | Remote is configured; the latest work still has to be committed and pushed | |

## 2. Where the implementation differs from the assignment

These are deliberate decisions, listed so they are not mistaken for omissions.

1. **`POST /quizzes` and `DELETE /quizzes/:id` require a login.** Quizzes belong to a user, and only the owner can delete (or edit) them. Calling these endpoints without a `Authorization: Bearer <token>` header returns 401. `GET` endpoints stay public. Use `POST /auth/login` (or the seeded `demo@example.com` / `password123`) to get a token; Swagger at `/api` has an Authorize button.
2. **Every question carries a `correctAnswer`.** The create payload needs it (boolean for Boolean, string for Input, list of options for Checkbox) so answers can be graded. The API never returns correct answers to quiz takers.
3. **`/quizzes/:id` is read-only for guests, but logged-in users can solve the quiz.** The assignment asks for "not for solving, just structure". Guests see exactly that; clicking an answer opens a "log in to solve quizzes" prompt. Logged-in users get answer controls and a Submit button.

## 3. Additional features (not in the assignment)

### Accounts and ownership
- Register and log in with JWT (`/auth/register`, `/auth/login`, `/auth/me`), pages `/register` and `/login`.
- Password hashing with bcrypt, redirect back to the page you came from after login.
- Quiz ownership: only the owner sees and can use the edit and delete actions.
- Users endpoints (`GET /users`, `GET /users/:id`).

### Solving quizzes
- Answer quizzes as a logged-in user and see the score with per-question correct/wrong feedback.
- `POST /quizzes/:id/attempts` grades the answers on the server.
- Login prompt modal for guests who try to answer.
- Forgiving grading of short-text answers: case, extra spaces and edge punctuation are ignored, and a list answer such as `sky, cloud, sunrise` can be given in any order with commas, semicolons, slashes or spaces (`backend/src/quizzes/question-answers.ts`).

### Profile and history
- `/profile` page reached by clicking your name in the top bar: stats (quizzes created, attempts, average score), the quizzes you created, and the history of quizzes you took.
- `/profile/attempts/:id`: a past attempt with your answer, the correct answer and the verdict for every question.
- Backend: `GET /profile`, `/profile/quizzes`, `/profile/attempts`, `/profile/attempts/:id`.

### Editing quizzes
- `/quizzes/:id/edit`: change the title, edit, add or remove questions, options and correct answers.
- Backend: `GET /quizzes/:id/edit` (owner only, includes correct answers) and `PUT /quizzes/:id`.
- Past attempts keep their own snapshot, so editing a quiz does not alter history.

### Forms and validation
- All forms use React Hook Form with Zod schemas: inline errors under each field, trimmed values, rules for email, password strength, duplicate options and required correct answers.
- The sign-up form starts empty (browser autofill is prevented).

### UI and design
- Custom-styled radio buttons and checkboxes, answer options as selectable cards.
- Animations: cards fade in, modal and score pop in, correct/wrong feedback, button and hover effects. Animations are switched off when the system asks for reduced motion.
- Compact, centred login and register forms; mobile-friendly layouts.

### Backend and tooling
- Swagger / OpenAPI documentation at `/api`.
- Sequelize migrations for the whole schema (`npm run migrate`).
- Idempotent seed script for a demo user and a sample quiz.
- Input validation with `class-validator`, CORS restricted to the frontend origin (`CORS_ORIGIN`).
- Troubleshooting section and everyday-commands table in the README.

## 4. Not covered

- There are no automated tests (unit or end-to-end); checks are lint, formatting and type checking.
