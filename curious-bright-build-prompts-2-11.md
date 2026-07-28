Build Prompts: Curious Bright — Phases 2 through 11
=====================================================

Continues directly from `curious-bright-build-prompt.md` (Phase 1). Use these the same way: hand one phase at a time to a coding agent or developer, confirm the "definition of done" before moving to the next. Don't skip ahead — later phases assume earlier schema/packages already exist.

---

## Phase 2 — File Handling & Moderation Pipeline

```
Context: Phase 1 (auth + minimal User/Submission schema) is done and
working locally. Now build the file upload and moderation flow for
Curious Bright's academic repository.

Tasks, in order:

1. Add S3-compatible storage config to apps/backend — use MinIO
   locally (already in docker-compose from Phase 1), Cloudflare R2
   in production (same S3 API, just different endpoint/credentials
   via env vars).

2. Implement presigned upload:
   - POST /submissions/upload-url — authenticated route, returns a
     presigned PUT URL + the eventual public fileUrl. Client uploads
     the PDF/EPUB directly to storage, never through the backend.
   - Validate file type (pdf, epub only) and a max size limit before
     issuing the presigned URL.

3. Implement submission CRUD:
   - POST /submissions — creates a Submission with status PENDING,
     using the fileUrl from step 2. Validate with Zod
     (packages/validation).
   - GET /submissions?status=&academicLevel= — paginated list,
     public ones only unless requester is MODERATOR/ADMIN.
   - GET /submissions/:id

4. Moderation routes (MODERATOR/ADMIN only, guard with a
   requireRole middleware extending Phase 1's requireAuth):
   - PATCH /submissions/:id/status — flips PENDING -> APPROVED or
     REJECTED. Reject with a reason field, stored or emailed (email
     can be a stub/log for now).

5. Add requireRole middleware to apps/backend, reusable for every
   future role-gated route (peer-review, moderation, org-admin).

Definition of done: an authenticated user can request a presigned
URL, "upload" a file to local MinIO, create a submission referencing
it, and a MODERATOR account can approve/reject it via the API.
No UI yet — this phase is backend-only.
```

---

## Phase 3 — Web Portal

```
Context: Phase 2's submission + moderation API works. Now build the
first real web UI in apps/web (React + Vite).

Tasks:

1. Auth pages: /register, /login. Store JWT in an HttpOnly cookie
   set by the backend (adjust Phase 1's login route to set the
   cookie rather than just returning the token in the body).

2. Public catalog: /browse — lists APPROVED submissions, filterable
   by academicLevel. Works for guests (no auth required), matching
   the blueprint's "guests can browse" rule.

3. Submission flow: /submit (authenticated only) — form for title,
   description, academicLevel; handles the presigned-upload-then-
   create-submission flow from Phase 2 end to end.

4. Reading view: /read/:submissionId — integrate PDF.js to render
   the file in-browser rather than forcing a download. EPUB support
   can be a follow-up if PDF.js covers your initial content type.

5. Basic moderator dashboard: /moderate (MODERATOR/ADMIN only) —
   list PENDING submissions, approve/reject buttons calling Phase
   2's PATCH route.

6. Apply the frontend-design principles for visual polish — this is
   the first thing real users (your nerd community) will see, so
   it should look intentional, not like default component styling.

Definition of done: a user can register, log in, browse approved
submissions as a guest, submit a paper while logged in, read a PDF
in-browser, and a moderator can approve it through the UI.
```

---

## Phase 4 — Mobile App

```
Context: Web portal works end-to-end. Now bring the same core flows
to apps/mobile (Expo/React Native), reusing packages/types and
packages/validation from the monorepo.

Tasks:

1. Set up Expo Router (or React Navigation) with the same core
   screens as web: Login, Register, Browse, Submit, Read, Moderate.

2. Auth: since mobile can't use HttpOnly cookies the way web does,
   store the JWT in Expo SecureStore. Adjust the backend's login
   route (or add a mobile-specific one) to return the token in the
   response body for this client, while web keeps using the cookie.

3. Presigned upload flow: reuse the same /submissions/upload-url API
   — Expo's file system + fetch can PUT directly to the presigned
   URL same as web.

4. Reading view: integrate a native PDF rendering library (e.g.
   react-native-pdf) with local caching so a previously opened
   document is readable offline.

5. Share the Zod validation logic from packages/validation for form
   inputs — don't re-implement validation rules separately on
   mobile.

Definition of done: the same register -> browse -> submit -> read
flow works on a real device/simulator, with offline reading for a
previously opened document.
```

---

## Phase 5 — Community & Chat Foundations

```
Context: Core repository (web + mobile) is functional. Now add the
real-time community layer — this introduces a new service and new
schema.

Tasks:

1. Extend packages/database/schema.prisma with RoomType, Room,
   RoomMember, Message (per the blueprint's §4.2). Run a migration.

2. Scaffold apps/realtime-gateway as its own Express + Socket.io
   service (separate from apps/backend — different scaling profile,
   per the blueprint's architecture rationale). Connect it to Redis
   (already in docker-compose) via the Socket.io Redis adapter, so
   it's multi-instance-ready even if you only run one instance now.

3. Create packages/realtime-contracts — defines every socket event
   name and payload type as the single source of truth. Start with:
   message:send, message:receive, presence:update.

4. REST routes in apps/backend for non-realtime room management:
   - POST /rooms (create TOPIC or GROUP room)
   - GET /rooms?topic= (discover public communities)
   - POST /rooms/:id/join, POST /rooms/:id/leave
   - GET /rooms/:id/messages?cursor= (paginated history)

5. Socket handlers in realtime-gateway: authenticate the socket
   connection using the same JWT from Phase 1, join the user to
   their Room channels on connect, handle message:send by
   persisting to Postgres via packages/database then broadcasting
   message:receive to the room.

6. Web + mobile UI: a /community section listing joinable topic
   rooms, a chat screen (group and 1-on-1) consuming the socket
   events from packages/realtime-contracts.

Definition of done: two logged-in users (web or mobile, mixed is
fine) can join the same topic room and exchange messages in real
time, with history loading on reconnect.
```

---

## Phase 6 — Collaborative Whiteboard

```
Context: Chat works. Now add the shared whiteboard, attachable to
any room.

Tasks:

1. Extend the schema with WhiteboardSession (per blueprint §4.2).
   Migrate.

2. Create packages/whiteboard-engine — wraps Yjs, exposes a
   platform-agnostic API (createDoc, applyUpdate, getSnapshot) that
   both web and mobile renderers will consume. Keep rendering
   logic OUT of this package — it's data/sync only.

3. Extend realtime-gateway to handle whiteboard sync: a
   whiteboard:update event carries a Yjs update payload, gets
   applied to the in-memory doc (held per WhiteboardSession, backed
   by Redis for multi-instance), and rebroadcast to other
   connections on that session. Add whiteboard:sync for a client
   joining mid-session to get the current full state.

4. Snapshot job: every N seconds (or on last-participant-leaves),
   serialize the Yjs doc, upload to S3/R2, save the URL to
   WhiteboardSession.snapshotUrl.

5. Web renderer: integrate tldraw (or similar), wire its change
   events to whiteboard-engine's applyUpdate, and its canvas state
   to render from the synced doc.

6. Mobile renderer: build a Skia-based canvas consuming the same
   whiteboard-engine doc — this can lag the web renderer in feature
   completeness initially (e.g. basic pen + shapes before advanced
   tools), that's an acceptable v1 scope cut.

7. UI: a "Whiteboard" tab/button inside any Room, opening a
   WhiteboardSession tied to that room.

Definition of done: two users in the same room can draw on a shared
whiteboard simultaneously and see each other's strokes live, and a
reload restores the current board state rather than a blank canvas.
```

---

## Phase 7 — Video Calling

```
Context: Chat and whiteboard work. Now add video calls, using
LiveKit Cloud (free tier to start) rather than self-hosting an SFU.

Tasks:

1. Extend the schema with CallStatus, CallSession, CallParticipant
   (per blueprint §4.2). Migrate.

2. Scaffold apps/signaling-service — a lightweight service whose job
   is: create/manage LiveKit rooms via LiveKit's server SDK, issue
   short-lived join tokens to authenticated users, and log
   CallSession/CallParticipant rows to Postgres on join/leave events
   (LiveKit can send webhooks for this).

3. Socket events for call invites (call:invite, call:accept,
   call:decline, call:end) live in realtime-gateway, NOT
   signaling-service — signaling-service only handles the actual
   WebRTC/LiveKit connection setup once a call is accepted.

4. Web + mobile: integrate LiveKit's client SDK (has both React and
   React Native support). Build a call screen: video tiles,
   mute/camera toggle, leave button.

5. 1-on-1 vs group: for now, route both through LiveKit for
   simplicity — true P2P for 1-on-1 is a later optimization, not
   required for a working v1.

6. In-call whiteboard: mount the Phase 6 whiteboard component inside
   the call UI, backed by a WhiteboardSession tied to the same Room
   — this is the "study together" moment the whole platform is
   built around, so make sure this integration actually works
   smoothly, not just technically exists.

Definition of done: two users can start a video call from a room,
see/hear each other, and open the shared whiteboard without leaving
the call.
```

---

## Phase 8 — Moderation & Safety Layer

```
Context: All core student-facing features exist. Now add the safety
layer before wider rollout.

Tasks:

1. Report/block:
   - POST /rooms/:id/report or /messages/:id/report — logs a report
     (add a lightweight Report model: id, targetType, targetId,
     reporterId, reason, createdAt, status).
   - POST /users/:id/block — client-side filtering of blocked users'
     messages; store in a UserBlock model (blockerId, blockedId).

2. Rate limiting: add rate limiting middleware to realtime-gateway's
   message:send handler (e.g. token bucket per user, via Redis) to
   protect Postgres/Redis from spam or abuse.

3. Room moderation roles: extend RoomMember.isAdmin usage — room
   admins can remove members or delete messages within their own
   room; platform MODERATOR/ADMIN roles can act across any room.

4. Admin dashboard additions (web): a reports queue, similar in
   pattern to Phase 3's submission moderation queue.

Definition of done: a user can report a message, get rate-limited if
spamming, and a moderator can see and act on reports through the UI.
```

---

## Phase 9 — Expert Peer-Review System

```
Context: Core platform + safety layer are live. Now add expert-
verified peer review for submissions.

Tasks:

1. Extend schema with ReviewVote, ExpertProfile, Review (per
   blueprint §4.3). Add UNDER_REVIEW handling to the existing
   Status enum usage. Migrate.

2. Expert application flow:
   - POST /experts/apply — authenticated user submits
     fieldOfExpertise + credentialsUrl (reuse the Phase 2 presigned
     upload flow for the credentials file), creates an unapproved
     ExpertProfile.
   - PATCH /experts/:id/approve — ADMIN-only, flips isApproved true,
     which should also grant the user's Role -> EXPERT (or add EXPERT
     as an additional capability check rather than replacing their
     existing role, depending on whether experts keep student
     privileges too — decide and document this choice).

3. Review flow:
   - When a MODERATOR wants a submission peer-reviewed instead of
     directly approving it, PATCH its status to UNDER_REVIEW.
   - POST /submissions/:id/reviews — EXPERT-only, one per submission
     per reviewer (enforce via the schema's @@unique constraint),
     records vote + optional comment.
   - A tally job (can be a simple check-on-each-vote function
     initially, no need for a cron yet) checks if the submission has
     hit the minimum vote threshold (make this a configurable
     constant, e.g. 3), and if so computes the majority outcome and
     updates Submission.status accordingly. REQUEST_CHANGES sends it
     back to PENDING with reviewer comments visible to the author.

4. Web UI: a reviewer dashboard (/review) listing UNDER_REVIEW
   submissions in the expert's fieldOfExpertise, with a vote form.

Definition of done: an approved expert can vote on a submission
under review, and after enough votes come in, the submission's
status updates automatically to reflect the majority outcome.
```

---

## Phase 10 — Monetization

```
Context: This phase happens ENTIRELY in the separate private repo,
curious-bright-institutional — not in curious-bright.

Tasks:

1. First, in curious-bright (public repo): add Organization,
   PlanTier, SubscriptionStatus, Subscription to
   packages/database/schema.prisma (per blueprint §4.4), and add
   the organizationId relation to User. Migrate. Bump the package
   version and publish packages/database, packages/types,
   packages/validation to GitHub Packages (per the earlier GitHub
   Packages setup) so the private repo can consume the updated
   schema types.

2. Scaffold curious-bright-institutional as its own repo (private,
   per the earlier hosting/repo-split setup), with
   apps/institutional-billing (Express + TypeScript). Install
   @curious-bright/database, @curious-bright/types,
   @curious-bright/validation from GitHub Packages.

3. Org onboarding:
   - POST /organizations — creates an Organization (defaults to
     FREE plan).
   - POST /organizations/:id/invite — bulk-invite staff/students by
     email, associating them to the org via User.organizationId
     (this route needs to call curious-bright's public backend API
     to actually update User records — remember: no shared database
     connection, only authenticated REST calls between the two
     services).

4. Paystack/Flutterwave integration:
   - POST /organizations/:id/subscribe — initiates checkout.
   - Webhook receiver (POST /webhooks/paystack,
     /webhooks/flutterwave) — verifies signature, updates
     Subscription.status and currentPeriodEnd.

5. Org admin dashboard (separate small web app, or a section of the
   institutional service's own frontend — your call): usage reports
   scoped to the org's own members only, branded community setup,
   bulk verification tools.

Definition of done: an org can be created, its admin can invite
members, subscribe via Paystack/Flutterwave test mode, and the
webhook correctly updates their subscription status — all without
a single line of billing code existing in the public repo.
```

---

## Phase 11 — Open Source Launch Readiness

```
Context: Product is functionally complete. This phase is about
making the public repo actually ready for outside contributors and
public visibility.

Tasks:

1. Confirm the AGPL-3.0 LICENSE file is correct and complete (full
   legal text, not a summary) at the curious-bright repo root.

2. File the trademark application for "Curious Bright" (name +
   logo) — this is a legal/business step, not code, but track it as
   a checklist item before any public announcement.

3. Set up CLA-assistant (or an equivalent bot) so first-time
   contributors must accept a CLA before their first PR merges.
   Link it in CONTRIBUTING.md.

4. Write a real CONTRIBUTING.md: local setup (docker-compose up),
   how to run tests, branch/PR conventions, code style/lint rules,
   and how the phase-based roadmap maps to open "good first issue"
   style tickets for new contributors.

5. Set up a public roadmap board (GitHub Projects is fine) so
   contributors can see what's being worked on without asking.

6. Security check: confirm no secrets, API keys, or .env files are
   committed anywhere in repo history (run a secrets scanner like
   gitleaks across the full history before making the repo public,
   not just the current commit).

7. Confirm curious-bright-institutional has zero references to it
   from the public repo beyond the documented GitHub Packages
   dependency direction (public -> institutional never happens,
   only institutional -> public via packages).

Definition of done: the repo is genuinely safe and welcoming to open
externally — license correct, secrets clean, contribution path
documented, and the institutional/public boundary verified, not
just assumed.
```
