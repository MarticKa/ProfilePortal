# Profile Portal

Profile Portal is a small local Next.js application designed as a practical QA Automation Tester assignment. It supports registration, token-based login, editing the current user's profile, password changes, and local avatar/GDPR document uploads. Data is stored in `data/users.json`; uploaded files are stored in `public/uploads`.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The initial demo account is:

- Email: `demo@example.com`
- Password: `Password1!`

## Pages

- `/register` — create an account
- `/login` — authenticate and store the returned token in local storage
- `/profile` — protected profile, password and file management page

## API

JSON errors use the consistent shape `{ "error": "Error message" }`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | 201 |
| POST | `/api/auth/login` | Log in and receive a token | 200 |
| POST | `/api/auth/logout` | Invalidate a token | 204 |
| GET | `/api/profile` | Read current profile | 200 |
| PATCH | `/api/profile` | Update name and address | 200 |
| PATCH | `/api/profile/password` | Change password | 204 |
| POST | `/api/profile/avatar` | Upload `file` (`jpg/jpeg/png`, max 2 MB) | 201 |
| DELETE | `/api/profile/avatar` | Delete current avatar | 204 |
| POST | `/api/profile/gdpr-document` | Upload `file` (`pdf/doc/docx`, max 5 MB) | 201 |
| DELETE | `/api/profile/gdpr-document` | Delete current document | 204 |

Registration expects `email`, `firstName`, `lastName`, and `password`. Profile updates expect `firstName`, `lastName`, and an `address` with `street`, `houseNumber`, `city`, `postalCode`, and a country in `CZ, SK, PL, DE, AT, HU, SI`.

## Test endpoints

These local-only helpers make independent automated tests easy to arrange and clean up:

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/api/test/reset` | Remove all users/uploads and recreate the demo user | 204 |
| POST | `/api/test/users` | Create a test user (same body/validation as registration) | 201 |
| DELETE | `/api/test/users/:id` | Delete a user and their uploads; idempotent | 204 |

Do not expose the test endpoints in a production deployment.

## Suggested QA automation assignment

Write a small Playwright test suite for this application.

Expected time investment: up to 2 hours.

Please include:

- at least 2 UI tests
- at least 2 API tests
- at least 1 test combining API setup with UI verification (E2E)
- short README explaining selected scenarios, assumptions and what you would add with more time

We do not expect full coverage. Focus on scenario selection, test architecture, data handling and API usage.
