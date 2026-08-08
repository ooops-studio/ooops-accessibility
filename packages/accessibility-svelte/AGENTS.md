# Accessibility Svelte Adapter Guidance

- Keep components thin Svelte 5 adapters over `@ooopsstudio/accessibility`; do not duplicate preference state, persistence, focus trapping or reduced-motion behavior.
- Use the core controller and focus trap for all interactions, and destroy both during component cleanup.
- Preserve accessible names, dialog semantics, keyboard behavior, focus restoration and storage behavior in integration tests.
- Keep the components generic and themeable through stable `ooops-a11y-*` class hooks and CSS custom properties.
- Treat the Svelte peer range and exported component paths as public compatibility contracts.
