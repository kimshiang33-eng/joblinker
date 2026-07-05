# Employer dashboard QA

## Evidence

- Mobile screenshot: `design/employer-dashboard-mobile.png`
- Desktop screenshot: `design/employer-dashboard-desktop.png`
- Route: `/employer/dashboard?lang=en`
- Viewports: 390 × 844 and 1440 × 1024

## Checks

- Dashboard uses the established JobLinker blue, neutral surfaces, thin borders, and restrained radii.
- Mobile layout has no horizontal document overflow; desktop exposes the persistent employer sidebar.
- Metrics recalculate from the current job state.
- Job search and status filters update the visible list.
- Pause/resume updates the job state and available action.
- Create, edit, delete, and Boost controls open purposeful dialogs.
- English/Malay switching updates dashboard and job-management copy.
- No Next.js error overlay was detected.
- Lint and production build pass.

final result: passed
