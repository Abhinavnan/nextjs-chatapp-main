# PostHog post-wizard report

The wizard has completed a full PostHog analytics integration for your Next.js 16 App Router chat application. Here is a summary of all changes made:

- **`instrumentation-client.ts`** (new): Initializes PostHog client-side using the `instrumentation-client.ts` pattern recommended for Next.js 15.3+. Enables exception autocapture, a reverse-proxy `api_host`, and debug mode in development.
- **`next.config.ts`** (updated): Added reverse-proxy rewrites for `/ingest/*`, `/ingest/static/*`, and `/ingest/array/*` to route PostHog traffic through your own domain, bypassing ad blockers. Also set `skipTrailingSlashRedirect: true` as required by PostHog.
- **`.env.local`** (new): Created with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`; covered by `.gitignore`.
- **`app/components/register/RegistrationForm.tsx`** (updated): Added `posthog.identify()` + `posthog.capture()` for `user_registered` and `user_logged_in`, and `posthog.capture()` for `password_reset_completed`, `profile_edited`, and `password_changed`.
- **`app/components/reset-password/ResetPassword.tsx`** (updated): Added `posthog.capture()` for `password_reset_requested` and `email_verified`.
- **`app/components/contact/Chat.tsx`** (updated): Added `posthog.capture()` for `chat_opened` with the contact ID as a property.
- **`app/components/chat/ChatField.tsx`** (updated): Added `posthog.capture()` for `message_sent` with the receiver index as a property.
- **`app/components/contact/ContactInfo.tsx`** (updated): Added `posthog.capture()` for `contact_info_viewed` with the contact ID as a property.
- **`app/global-error.tsx`** (updated): Added `posthog.captureException(error)` to forward unhandled global errors to PostHog Error Tracking.
- **`app/(private)/error.tsx`** (updated): Added `posthog.captureException(error)` inside the `useEffect` to capture errors within the authenticated layout.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `user_registered` | Fired when a user successfully submits the registration form. | `app/components/register/RegistrationForm.tsx` |
| `user_logged_in` | Fired when a user successfully logs in via the login form. | `app/components/register/RegistrationForm.tsx` |
| `password_reset_requested` | Fired when a user requests a password reset by submitting their email. | `app/components/reset-password/ResetPassword.tsx` |
| `email_verified` | Fired when a user successfully verifies their email with the verification code. | `app/components/reset-password/ResetPassword.tsx` |
| `password_reset_completed` | Fired when a user successfully resets their password after verification. | `app/components/register/RegistrationForm.tsx` |
| `profile_edited` | Fired when a user successfully updates their profile information. | `app/components/register/RegistrationForm.tsx` |
| `password_changed` | Fired when a user successfully changes their account password. | `app/components/register/RegistrationForm.tsx` |
| `chat_opened` | Fired when a user clicks to open a chat with a contact. | `app/components/contact/Chat.tsx` |
| `message_sent` | Fired when a user sends a message in a chat conversation. | `app/components/chat/ChatField.tsx` |
| `contact_info_viewed` | Fired when a user opens the info panel for a specific contact. | `app/components/contact/ContactInfo.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/511513/dashboard/1844953)
- [User Registrations (wizard)](https://us.posthog.com/project/511513/insights/XIAwJB7J)
- [User Logins (wizard)](https://us.posthog.com/project/511513/insights/zALeOhLu)
- [Registration to Login Funnel (wizard)](https://us.posthog.com/project/511513/insights/gMWc08oO)
- [Messages Sent (wizard)](https://us.posthog.com/project/511513/insights/o0zrhTQ3)
- [Chat Engagement (wizard)](https://us.posthog.com/project/511513/insights/IjFki8dx)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `posthog.identify()` is only called on fresh login/register; if users refresh while already authenticated, add an identify call on session restore so returning sessions are not left on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
