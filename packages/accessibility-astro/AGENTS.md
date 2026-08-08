# Accessibility Astro Adapter Guidance

- Keep components thin over `@ooopsstudio/accessibility`; use semantic dialog/control markup and safe inline serialization.
- Ensure initialization is idempotent across Astro client navigation and preferences apply before visible paint where supported.
- Test keyboard opening, focus trapping, Escape, reset and persistence. Do not duplicate controller logic.
