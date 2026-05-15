# GoTogether Architecture

## Goals

- Low-cost MVP with scalable foundations.
- Accessible UX for older adults and families.
- Secure payments, uploads, and real-time coordination.

## Stack

- Frontend: Next.js App Router, Tailwind CSS, shared UI package.
- Backend: NestJS (TypeScript), Prisma ORM, Socket.IO.
- Database: PostgreSQL (Supabase-ready).
- Payments: Stripe Connect (manual capture for hold and release).
- Storage: Cloudflare R2 using S3-compatible SDK.
- Auth: Magic Link via Resend.

## Core flow

1. Briefing
2. Perfilado
3. Match inteligente
4. Reserva y pago
5. Coordinacion y reporte
