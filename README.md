# DocumentRag

DocumentRag is a secure internal AI copilot for software companies and legal teams. It combines retrieval, RBAC, human review, and final approved answers so teams can search internal documents, review grounded AI drafts, and save trusted knowledge artifacts.

## What the product does

DocumentRag is built around a trust workflow instead of a loose chatbot flow:

- employees ask questions against internal documents
- the backend retrieves only documents they are allowed to access
- AI creates a review draft grounded in retrieved context
- a user or admin can approve or discard the draft
- approved drafts become canonical `ApprovedAnswer` records
- approved answers can be reused as trusted internal knowledge

This project currently supports engineering and legal-team testing scenarios such as:

- onboarding docs
- incident runbooks
- deployment guidance
- internal API conventions
- contract review playbooks
- privacy escalation policies
- remote work and internal policy questions

## Stack

- Frontend: `Next.js 16`, `React 19`, `Tailwind CSS 4`
- Backend: `Express 5`, `TypeScript`, `Prisma`, `MongoDB`
- AI: `Google Gemini`
- Security: JWT auth, AES payload obfuscation, role-aware and user-assigned visibility
- Testing: `Vitest`

## Project structure

- `src/` backend routes, services, middleware, schemas, seed logic
- `frontend/` App Router frontend, session helpers, request client, admin pages
- `prisma/schema.prisma` MongoDB models for users, documents, chunks, workflow drafts, and approved answers
- `src/scripts/seed.ts` reset-and-reseed script with engineering and legal test data
- `.orchids/orchids.json` local startup command metadata

## Core concepts

### Roles

- `ADMIN`
- `EMPLOYEE`

### Draft lifecycle

A query creates a `WorkflowDraft`.

Draft statuses:

- `PENDING`
- `EXECUTED`
- `DISCARDED`

When a draft is executed:

- the draft is marked `EXECUTED`
- review metadata is stored on the draft
- a canonical `ApprovedAnswer` is created once

When a draft is discarded:

- the draft is marked `DISCARDED`
- rejection metadata is stored
- no approved answer is created

### Visibility model

This project now uses explicit user assignment for document visibility.

That means:

- employees do **not** automatically see all documents from their department
- admins upload documents first
- admins explicitly assign which employee users can access each document
- only assigned users can retrieve that document in queries
- approved answers inherit visibility from the source document access set
- admins can still view all documents and approved answers

This prevents one engineer from automatically seeing every other engineering document just because they share the same department label.

## Environment variables

Root `.env`:

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `PORT`
- `OBFUSCATION_KEY`

Frontend `.env.local`:

- `NEXT_PUBLIC_API_URL` default: `http://localhost:3001/api`
- `NEXT_PUBLIC_OBFUSCATION_KEY` should match backend `OBFUSCATION_KEY`

## Prerequisites

- `Node.js` 20+
- `npm`
- a reachable MongoDB database
- a valid Gemini API key

## Development

Backend:

```bash
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Build

Backend:

```bash
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

## Tests

Frontend tests:

```bash
cd frontend
npm test
```

Current automated tests cover the obfuscation helpers in `frontend/src/requests/obfuscation.test.ts`.

## Reset and reseed the database

This project includes a reset-style seed script.

Run:

```bash
npm run seed
```

The seed script will:

- delete users
- delete documents and document chunks
- delete workflow drafts
- delete approved answers
- recreate demo users
- recreate searchable engineering and legal documents
- assign document visibility to specific users

## Seeded users

All seeded users use the same password:

- Password: `securepassword123`

Accounts:

- `admin@documentrag.dev`
- `engineer@documentrag.dev`
- `platform@documentrag.dev`
- `legal@documentrag.dev`
- `counsel@documentrag.dev`

## Seeded access model

The seed intentionally proves that visibility is user-specific.

### Engineering

- `engineer@documentrag.dev` can access:
  - `engineering-onboarding.txt`
  - `security-secrets-policy.txt`
  - `company-remote-work-policy.txt`

- `platform@documentrag.dev` can access:
  - `incident-escalation-runbook.txt`
  - `security-secrets-policy.txt`
  - `company-remote-work-policy.txt`

### Legal

- `legal@documentrag.dev` can access:
  - `legal-contract-review-playbook.txt`
  - `company-remote-work-policy.txt`

- `counsel@documentrag.dev` can access:
  - `privacy-escalation-policy.txt`
  - `company-remote-work-policy.txt`

This means two users in the same department can still see different data.

## Main user flows

### 1. Login

- user opens `/login`
- user signs in with email and password
- frontend stores the session token and user data
- user is routed into the app

### 2. Admin ingestion

- admin opens `/admin/ingestion`
- admin uploads a `.txt`, `.pdf`, `.csv`, or `.xlsx` document
- backend extracts text, chunks content, creates embeddings, and stores document records
- uploaded documents start as admin-controlled assets
- admin explicitly assigns which employees can access each document from the ingestion UI

### 3. Employee creation

- admin opens `/admin/rbac`
- admin creates employee accounts with email, password, and department label
- these employee users can later be assigned document visibility from the ingestion page

### 4. Query workflow

- employee opens `/dashboard`
- employee asks a question
- backend embeds the query
- backend searches only chunks assigned to that employee
- backend drafts a grounded response
- draft is stored in `WorkflowDraft` as `PENDING`

If no strong match is found, the app returns a missing-information draft that explains the answer is not present in the currently accessible documents.

### 5. Review workflow

- user can review their own drafts on `/dashboard`
- admin can review all pending drafts on `/admin/monitor`
- actions:
  - `Execute`
  - `Discard`

### 6. Approved answers

- executed drafts create `ApprovedAnswer` records
- employees can view trusted final answers on `/answers`
- admins can review all approved answers on `/admin/answers`
- workflow history remains on `/workflows`

## Frontend routes

- `/`
- `/login`
- `/dashboard`
- `/answers`
- `/workflows`
- `/admin/ingestion`
- `/admin/rbac`
- `/admin/monitor`
- `/admin/answers`

## Backend API routes

### Auth

- `POST /api/auth/login`

### Query and workflow

- `POST /api/query`
- `GET /api/workflow/pending`
- `GET /api/workflow/history`
- `POST /api/workflow/:id/action`
- `GET /api/workflow/admin/pending`
- `POST /api/workflow/admin/:id/action`

### Approved answers

- `GET /api/answers`
- `GET /api/answers/:id`
- `GET /api/answers/by-draft/:draftId`
- `GET /api/admin/answers`

### Documents and admin

- `POST /api/upload`
- `POST /api/admin/users`
- `GET /api/admin/users`
- `GET /api/admin/documents`
- `POST /api/admin/documents/:id/visibility`

### Health

- `GET /api/health`

## Recommended manual test flow

### 1. Start the app

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### 2. Reset and seed

```bash
npm run seed
```

### 3. Login as admin

Use:

- `admin@documentrag.dev`
- `securepassword123`

### 4. Verify document assignment behavior

Open `/admin/ingestion`.

You should see uploaded documents and assigned-user controls.

### 5. Test engineering isolation

Login as `engineer@documentrag.dev` and ask:

- `What is the onboarding process?`
- `How do we rotate secrets?`
- `How do we handle incident escalation?`

Expected result:

- onboarding should work
- secrets policy should work
- incident escalation should **not** be available unless admin assigns that runbook to this user

Then login as `platform@documentrag.dev` and ask:

- `How do we handle incident escalation?`

Expected result:

- this user should receive the runbook-based answer

### 6. Test legal isolation

Login as `legal@documentrag.dev` and ask:

- `How do we review non-standard contracts?`
- `What is the privacy request timeline?`

Expected result:

- contract review should work
- privacy timeline should not be available unless assigned

Then login as `counsel@documentrag.dev` and ask:

- `What is the privacy request timeline?`

Expected result:

- this user should receive the privacy-policy-based answer

### 7. Test approved-answer creation

- create a draft
- click `Execute` as user or admin
- verify it appears in `/answers`
- verify it is visible only to allowed users

### 8. Test discard behavior

- create another draft
- click `Discard`
- verify it stays in `/workflows`
- verify it does not appear in `/answers`

## Product positioning

DocumentRag is positioned as a secure internal AI copilot for engineering and legal knowledge.

Key ideas:

- grounded retrieval from internal docs
- explicit access control
- human-reviewed drafts
- approved final answers teams can trust

This makes the product useful where internal accuracy, auditability, and controlled visibility matter.

## Notes

- the frontend and backend use obfuscated payload transport in addition to standard auth
- the repository currently runs backend and frontend dev servers from `.orchids/orchids.json`
- for production use, rotate secrets, remove hardcoded local credentials, and harden deployment settings
