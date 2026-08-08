# Accessibility Packages Guidance

## Scope

These packages provide reusable accessibility preferences and Astro integration. They improve user controls but do not replace semantic, keyboard and content-level accessibility work in consuming projects.

## Required workflow

- Run the root validation suite before public changes and the targeted package checks while developing.
- Add unit tests for preferences/controllers and integration tests for keyboard, focus, dialog and persistence behavior.
- Maintain accessible names, semantic controls, focus restoration and reduced-motion behavior as non-regression requirements.

## Architecture

- The core package owns state, storage, classes, CSS variables and focus utilities. The Astro adapter owns only markup and initialization.
- Keep styles token-based and override-friendly. Never depend on Stage, application content or a fixed theme.

## Avoid

- Do not create duplicate focus traps or preference stores in adapters.
- Do not use click-only interactions, remove focus indicators, or make effects ignore user motion preferences.
