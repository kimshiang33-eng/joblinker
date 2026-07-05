# Job posting flow QA

## Evidence

- Mobile form: `design/job-post-form-mobile.png`
- Mobile success: `design/job-post-success-mobile.png`
- Desktop form: `design/job-post-form-desktop.png`
- Route: `/employer/jobs/new?lang=en`
- Viewports: 390 × 844 and 1440 × 1024

## Checks

- Dashboard “Post a new job” navigates to the new form route.
- Mobile form has no horizontal document overflow; desktop uses a sticky live-preview column.
- Step 1 validates bilingual titles, location, and salary range.
- Step 2 requires bilingual descriptions and requirements.
- Step 3 validates a Malaysian WhatsApp number and vacancies.
- Live preview updates from entered job data.
- Draft saving confirms local persistence.
- Successful submission clears the draft and displays a review confirmation state.
- English/Malay interface switching is available throughout the flow.
- No Next.js error overlay was detected.
- Lint and production build pass.

final result: passed
