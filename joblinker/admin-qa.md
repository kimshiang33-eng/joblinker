# Admin panel QA

## Evidence

- Mobile screenshot: `design/admin-panel-mobile.png`
- Desktop screenshot: `design/admin-panel-desktop.png`
- Route: `/admin`
- Viewports: 390 × 844 and 1440 × 1024

## Checks

- Mobile layout has no horizontal document overflow; desktop exposes the persistent admin sidebar.
- Pending-review, approved-job, employer, and total-view metrics match the mock dataset.
- Search and status filters update the review queue.
- Job detail review dialog exposes employer, salary, location, contact, and description.
- Approval removes a listing from the pending queue and updates the pending metric.
- Rejection requires feedback and updates the listing state.
- Approved listings support reversible Featured status.
- Basic job views, WhatsApp clicks, and click rate appear in the performance section.
- English/Malay controls and localized labels are present.
- No Next.js error overlay or browser warnings/errors were detected.
- Lint and production build pass.

final result: passed
