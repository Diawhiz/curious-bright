# `@curious-bright/ui-kit`

## Marginalia Design System

The `ui-kit` package serves as the single source of truth for Curious Bright's design system tokens, typography scales, and shared UI primitives.

### Functional Color Split Rules

To preserve visual semantics across the platform:

1. **Reading & Repository Domain (`/browse`, `/read`, `/submit`, `/moderate`)**:
   - Use **Paper (`#F7F7F2`)**, **Ink (`#1E2A4A`)**, **Highlighter (`#E8A93B`)**, and **Faded Ink (`#6B7690`)** ONLY.
   - Do **NOT** use Marginnote green anywhere in reading or repository screens.

2. **Live-Collaboration Domain (`/chat`, `/whiteboard`, `/calls`, presence indicators)**:
   - **Marginnote green (`#2E9E83`)** is strictly reserved for live features (user online status, active call badges, whiteboard cursors, live activity indicators).
   - This strict split ensures green signifies active live collaboration rather than decorative color.
