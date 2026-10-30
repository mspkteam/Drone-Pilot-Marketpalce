# Final Testing QA checklist

Source: `Drone-Final Testing/DroneFinalTesting.html` (QA Bugs Report, 22 Oct 2026).

Marks: **Done** · **Partial** · **Blocked on client**

---

## Client

| Item | Status |
|------|--------|
| Password eye icon should not disappear on hover | Done |
| New login: dashboard visible with complete-profile message | Done |
| Date format dd/mm/yyyy on date pickers | Done |
| BILLING (payment method) | Blocked on client (Stripe) |
| Talk to Support button radius / font color | Done |
| Profile fields not editable by default; Edit option | Done |
| Country / region / phone worldwide vs US | Blocked on client |
| File upload icon + stop showing bare “Choose file” after upload | Done (proposal attach) |
| Post a project: hide step-bleed fields | Done |
| Step 4 Expected Project Completion Date + date conflict | Done |
| Terms checkbox / popup checked state | Done (shared `termsAcknowledged` state) |
| Move Back button to the right | Done |
| Find a Pilot profile visible in dashboard | Done |
| Hire a Captain redirect | Done (guest → register; client → find pilots; hidden for pilots) |
| Close icon color | Done (job-approval modal gold) |
| Hire via marketplace purpose / redirect | Done (guest register; client post-project for that pilot) |
| Browse a pilot → Find a Pilot dashboard | Done |
| Field-level error / success under fields | Done (budget step field errors; banner retained) |
| Button alignment | Done (post-project footer min-height + spacing) |
| View profile 404 | Done (dashboard `/find-pilots/[id]`) |
| Button sizes consistent | Done (shared 2.75rem min-height on post-project buttons) |
| Revision: no prompt after submit; pilot receives request | Done |
| Invoice PDF downloadable | Blocked on client (Stripe) |
| Invite code copyable link + purpose copy | Done |

## Pilot

| Item | Status |
|------|--------|
| Portfolio bounce emptying fields | Done (0.27.104–106) |
| Selecting one service chip should not auto-select another | Done |
| Portfolio titles remain visible | Done (2-line caption on profile gallery) |
| First login: all screens visible; message to complete profile | Done |
| Popup height/width / Remove preview margin | Done (portfolio + avatar modals) |
| Highlighted links | Done (Verification / Certificates / Wings routes) |
| Insurance section | Done (profile Insurance block → Verification) |
| Profile strength % mismatch | Done (0.27.107) |
| Hire via marketplace on public profile | Done (hidden for logged-in pilots) |
| Pilot cannot hire a captain | Done |
| Where drafts are saved | Done (Save draft on Profile; copy confirms it) |
| Button margin | Done (post-project / shared control spacing) |
| A-1 Fast Forward button disabled | Done |
| Instructor student code | Done (field error under input + discounted enroll price) |
| Negotiation vs fixed-budget accept | Done (quote type on proposal; pilot_quotes skip budget cap) |
| A-6 Captain profile message | Done |
| View listing 404 | Done (applied jobs remain viewable) |
| Mention file format | Done (PNG/JPG/WEBP/GIF/PDF) |
| Add Link duplication | Done (start empty; Add/Remove per link) |
| Revision View notification + Complete Job after revision | Done |
| Dispute voting real scenarios | Done (admin can open/cast/close squadron vote) |
| Verification file-type / remove / field errors / wing bleed / drafts | Done (remove API; 5MB types; wing switch clears uploads) |
| CSV vs earnings format | Done (shared formatters for table + CSV) |
| View profile / Need info buttons | Done (View Profile + Request More Info) |
| Payment method realtime | Blocked on client (Stripe) |
| View Profile 404 | Done (dashboard path) |
| Admin wing notification | Done (staff notified on wing request submit) |
| Product pictures vs name | Blocked on client (need product-specific shop assets) |
| Payment + SMTP realtime | Blocked on client |
| Support chat automated | Blocked on client |
| Rank progress ≠ profile progress | Done (0.27.98) |
| License number on pilot dashboard profile | Done |
| Verification amendments vs Rejected / comments on every card | Done (Amendments Required stays in queue) |

## Admin

| Item | Status |
|------|--------|
| Show client/pilot name, not organization | Done |
| Edit Client Profile should not expose every feature | Done (edit/suspend only in command bar) |
| Billing address fetch / Save error | Done (JSON ↔ display helpers + GET/PATCH) |
| Job approval notification in bar | Done (admins notified on job submit) |
| Letter M cropped | Done (cert overlay text no longer ellipsis-clips) |
| Disabled checkbox purpose | Done (preview-only helper copy on config toggles) |
| Admin edit fails | Done (GET/PATCH restored on `/api/admin/users/[id]`) |
| Generate PDF scroll to pilot | Done (scrolls/highlights issued certificate row) |
| Certificate name editable / friendlier | Done (editable recipient name on issue + preview) |
| New briefing button | Done (removed until implemented) |
| A-6 Captain Aviator wing rank | Done (role shows plan name; wings column shows titles) |
| Verification docs match uploads / preview UX | Done (filename + in-modal preview) |
| Request more info deletes from queue | Done (amendments keep queue) |
| Preview Pricing / Full configuration 404 | Done (settings link) |
| Delayed notifications / timezone by region | Blocked on client |

---

When client answers Stripe / geo-phone / support automation / shop artwork, re-open Wave 5 and re-mark those rows.
