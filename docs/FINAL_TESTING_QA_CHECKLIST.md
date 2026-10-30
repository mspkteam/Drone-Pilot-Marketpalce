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
| Terms checkbox / popup checked state | Partial (existing 0.27.90 fix; re-QA) |
| Move Back button to the right | Done |
| Find a Pilot profile visible in dashboard | Done |
| Hire a Captain redirect | Done (guest → register; client → find pilots; hidden for pilots) |
| Close icon color | Done (job-approval modal gold) |
| Hire via marketplace purpose / redirect | Done (guest register; client post-project for that pilot) |
| Browse a pilot → Find a Pilot dashboard | Done |
| Field-level error / success under fields | Partial |
| Button alignment | Partial |
| View profile 404 | Done (dashboard `/find-pilots/[id]`) |
| Button sizes consistent | Partial |
| Revision: no prompt after submit; pilot receives request | Done |
| Invoice PDF downloadable | Blocked on client (Stripe) |
| Invite code copyable link + purpose copy | Done |

## Pilot

| Item | Status |
|------|--------|
| Portfolio bounce emptying fields | Done (0.27.104–106) |
| Selecting one service chip should not auto-select another | Done |
| Portfolio titles remain visible | Partial |
| First login: all screens visible; message to complete profile | Done |
| Popup height/width / Remove preview margin | Partial |
| Highlighted links | Partial |
| Insurance section | Partial (verification, not a client-profile block) |
| Profile strength % mismatch | Done (0.27.107) |
| Hire via marketplace on public profile | Done (hidden for logged-in pilots) |
| Pilot cannot hire a captain | Done |
| Where drafts are saved | Done (Save draft on Profile; copy confirms it) |
| Button margin | Partial |
| A-1 Fast Forward button disabled | Done |
| Instructor student code | Partial (apply-code UI exists) |
| Negotiation vs fixed-budget accept | Partial (quote type shown on proposal; accept still booking flow) |
| A-6 Captain profile message | Done |
| View listing 404 | Partial |
| Mention file format | Partial |
| Add Link duplication | Partial |
| Revision View notification + Complete Job after revision | Done |
| Dispute voting real scenarios | Done (admin can open/cast/close squadron vote) |
| Verification file-type / remove / field errors / wing bleed / drafts | Partial |
| CSV vs earnings format | Partial |
| View profile / Need info buttons | Partial |
| Payment method realtime | Blocked on client (Stripe) |
| View Profile 404 | Done (dashboard path) |
| Admin wing notification | Partial |
| Product pictures vs name | Partial |
| Payment + SMTP realtime | Blocked on client |
| Support chat automated | Blocked on client |
| Rank progress ≠ profile progress | Done (0.27.98) |
| License number on pilot dashboard profile | Done |
| Verification amendments vs Rejected / comments on every card | Done (Amendments Required stays in queue) |

## Admin

| Item | Status |
|------|--------|
| Show client/pilot name, not organization | Done |
| Edit Client Profile should not expose every feature | Partial |
| Billing address fetch / Save error | Partial |
| Job approval notification in bar | Partial |
| Letter M cropped | Partial |
| Disabled checkbox purpose | Partial |
| Admin edit fails | Partial |
| Generate PDF scroll to pilot | Partial |
| Certificate name editable / friendlier | Partial |
| New briefing button | Done (removed until implemented) |
| A-6 Captain Aviator wing rank | Partial |
| Verification docs match uploads / preview UX | Partial |
| Request more info deletes from queue | Done (amendments keep queue) |
| Preview Pricing / Full configuration 404 | Done (settings link) |
| Delayed notifications / timezone by region | Blocked on client |

---

When client answers Stripe / geo-phone / support automation, re-open Wave 5 and re-mark those rows.
