# Curious Bright

## Overview
**Curious Bright** is an open-source academic repository and real-time collaboration platform designed for learners, researchers, and educators spanning from High School to PhD candidates, as well as educational NGOs worldwide. The platform empowers students and academic communities to publish research, exchange discoveries, participate in peer review, and engage in real-time academic discussion through integrated communication tools.

By bridging the gap between open-access publication and real-time interactive learning, Curious Bright creates a global digital common room for intellectual exploration. Users can seamlessly conduct live research sessions, co-author documents, collaborate on interactive digital whiteboards, and hold high-definition video conferences all within a unified, open workspace.

> [!NOTE]
> **A Note on the Name:**
> Curious Bright (`curiousbright.com.ng`) was originally reserved for a personal blog for posting intellectual and thought pieces. The idea evolved into this platform instead.

---

## System Architecture

Curious Bright is architected as a high-performance TypeScript monorepo managed with **Turborepo** and **PNPM Workspaces**:

```text
curious-bright/
├── apps/
│   ├── backend/             # Express.js REST API & Business Logic
│   ├── mobile/              # React Native + Expo Mobile Application
│   ├── realtime-gateway/    # Socket.io & Redis State Synchronization
│   ├── signaling-service/   # WebRTC Signaling Service
│   └── web/                 # React + Vite Web Client
├── packages/
│   ├── database/            # PostgreSQL & Prisma ORM Schema & Client
│   ├── realtime-contracts/  # Shared Realtime Gateway Event Specs
│   ├── types/               # Shared TypeScript Type Definitions
│   ├── ui-kit/              # Shared UI Component Library
│   ├── validation/          # Shared Zod Data Validation Schemas
│   └── whiteboard-engine/   # Yjs CRDT Real-time Whiteboard Engine
```

---

## Tech Stack & Infrastructure

- **Monorepo Build Tooling:** [Turborepo](https://turbo.build/) & [PNPM Workspaces](https://pnpm.io/)
- **Backend API:** Express.js REST API (TypeScript)
- **Database & ORM:** PostgreSQL database with [Prisma ORM](https://www.prisma.io/)
- **Web Application:** React 18 & Vite
- **Mobile Application:** React Native with Expo
- **Real-Time Gateway:** Socket.io paired with Redis for pub/sub messaging and state sync
- **Collaborative Canvas:** [Yjs](https://yjs.dev/) CRDT framework for real-time shared whiteboards
- **Video & Audio Infrastructure:** [LiveKit](https://livekit.io/) WebRTC server infrastructure
- **Object Storage:** S3-compatible object storage (MinIO for local development)

---

## Key Features

- **Open Academic Publishing & Peer Review:** Publish academic articles, research papers, and preprints across various disciplines with built-in community peer-review tools.
- **Real-Time Interactive Whiteboard:** Collaborative canvas using CRDTs (`Yjs` + `whiteboard-engine`) enabling low-latency concurrent drawing and document annotation.
- **High-Definition Video Conferencing:** Integrated LiveKit WebRTC conferencing for live research meetings, virtual classrooms, and study groups.
- **Cross-Platform Access:** Responsive web portal and mobile app (Expo) ensuring seamless participation anywhere.
- **Event-Driven Messaging & State Sync:** High-performance real-time gateway utilizing Socket.io and Redis.



