# Contributing to Curious Bright

Thank you for your interest in contributing to Curious Bright! We welcome contributions from researchers, developers, students, and educators. Please review the following guidelines before contributing.

## Development Setup

To run the repository locally:

1. **Spin up local infrastructure services (PostgreSQL, Redis, LiveKit):**
   ```bash
   docker compose up -d
   ```

2. **Install workspace dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development servers:**
   ```bash
   pnpm run dev
   ```

## Pull Request Process

We follow an issue-first workflow to ensure smooth collaboration:

1. **Open an Issue First:** Before initiating code changes or starting a feature, please search existing issues or open a new issue to outline your proposed changes or feature enhancement.
2. **Discuss:** Engage with community members and maintainers in the issue discussion to agree on design decisions and implementation details.
3. **Submit a PR:** Once alignment is reached, submit your Pull Request linking back to the relevant issue.

### Contributor License Agreement (CLA)

All first-time contributors must sign our Contributor License Agreement (CLA) before a pull request can be merged. When you submit your first PR, a CLA assistant bot will prompt you to complete the agreement online ([Sign CLA Here](https://github.com/curiousbright/cla-placeholder)).

## Folder Ownership (Phase 1)

This project uses a TypeScript monorepo structure. Below is the ownership table for Phase 1 workspace components:

| Folder | Responsibility / Role |
| --- | --- |
| `apps/backend` | Express REST API server — handles auth, user management, and academic submissions |
| `apps/web` | React + Vite web application (placeholder) |
| `apps/mobile` | React Native / Expo mobile application (placeholder) |
| `packages/database` | Shared database schema, migrations, and generated Prisma client |
| `packages/types` | Shared TypeScript interfaces and type definitions |
| `packages/validation` | Shared Zod validation schemas for input sanitization |

## Coding Standards

- **TypeScript Strict Mode:** All code must pass strict TypeScript type checking (`strict: true`). Avoid using `any` types.
- **Zod Input Validation:** All API inputs, request payloads, and query parameters must be validated using Zod schemas from `packages/validation`.
- **Prisma Data Access:** All database queries and operations must go through Prisma ORM using `packages/database`. Raw SQL queries should be avoided unless strictly necessary.
