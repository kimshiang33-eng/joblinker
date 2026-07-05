# Employer authentication QA

## Evidence

- Mobile screenshot: `design/employer-auth-mobile.png`
- Desktop screenshot: `design/employer-auth-desktop.png`
- Tested production route: `/employer/login`
- Viewports: 390 × 844 and 1440 × 1024

## Checks

- Page renders with the existing JobLinker tokens, typography, borders, and blue accent.
- No horizontal overflow at the mobile viewport.
- No Next.js error overlay or browser console errors detected.
- English and Malay switching updates document language and interface copy.
- Login and registration tabs expose the correct fields and selected state.
- Empty registration submission displays a visible validation message.
- Valid login data routes to `/employer/dashboard?lang=en`.
- Public job-board “Post a job” link routes to the employer login.
- Keyboard-focus styling, labels, autocomplete attributes, and password visibility control are present.
- Lint and production build pass.

final result: passed
