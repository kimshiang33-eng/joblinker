# Job detail QA

Date: 2026-06-29

- Production build and ESLint pass.
- `/jobs/[id]` statically generates all six mock job pages.
- Mobile verified at 390 × 844: no horizontal overflow, fixed WhatsApp action visible, content remains readable above it.
- Desktop verified at 1440 × 1024: right application card visible and mobile action hidden.
- Home job title navigation opens the matching detail page.
- EN/BM switch updates job content and the WhatsApp call to action.
- No Next.js error overlay or browser console errors detected.
- Job pages include unique metadata and JobPosting structured data for later SEO indexing.
