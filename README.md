# SPOTTER - Personal Trainer Management System

A mobile-first SaaS solution for personal fitness trainers built with Next.js 16, Clerk, Supabase, and React Query.

## Features

- 🔐 **Authentication** - Clerk-powered user authentication
- 📊 **Client Management** - Track clients, packages, and workouts
- 💳 **Subscription System** - Free, Pro, and Ultra plans with limits
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🚀 **Type-Safe** - Full TypeScript support with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm/npm
- Clerk account ([sign up](https://clerk.com))
- Supabase account ([sign up](https://supabase.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spotter-saas-app
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in your environment variables in `.env.local`:

**Required:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` - From [Clerk Dashboard](https://dashboard.clerk.com)
- `NEXT_PUBLIC_SUPABASE_URL` - From [Supabase Dashboard](https://supabase.com/dashboard)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From [Supabase Dashboard](https://supabase.com/dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` - From [Supabase Dashboard](https://supabase.com/dashboard)

**Optional (for Phase 1):**
- `STRIPE_SECRET_KEY` - For payment processing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `OPENAI_API_KEY` - For AI features

5. Set up the database:
```bash
# Push migrations to Supabase
supabase db push
```

6. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.local.example` for all required environment variables.

### Required Variables

- **Clerk**: Authentication and user management
- **Supabase**: Database and storage

### Optional Variables

- **Stripe**: Payment processing (needed for subscription payments)
- **OpenAI**: AI-powered features (optional for Phase 1)

## Project Structure

```
app/
  (auth)/          # Authentication pages
  (dashboard)/     # Main app pages
  api/            # API routes
components/
  ui/             # shadcn/ui components
  layout/         # Layout components
  errors/         # Error components
lib/
  api/           # API utilities
  db/            # Database queries
  schemas/       # Zod validation schemas
  subscriptions/ # Subscription logic
  supabase/      # Supabase clients
hooks/           # React hooks
contexts/        # React contexts
providers/       # React providers
supabase/
  migrations/    # Database migrations
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm format` - Format code

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: React Query (TanStack Query)
- **Validation**: Zod
- **Testing**: Vitest

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

Private project - All rights reserved
