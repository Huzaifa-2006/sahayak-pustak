# Sahayak Pustak 📚

**A student-powered academic marketplace for University of Mumbai (Central Railway region)**

Buy, sell, and donate textbooks. Share PDF notes for free. Earn karma points for helping fellow students.

---

## Features

- 📚 **Book Marketplace** — Buy and sell second-hand textbooks
- 🎁 **Book Donations** — Donate books for free, earn **+300 karma**
- 📄 **Free Notes** — Upload/download PDF notes (always free), earn **+50 karma**
- 🏆 **Karma Leaderboard** — Public ranking of top contributors
- 🔐 **Auth** — Google OAuth + magic link email login
- 🛡️ **Secure** — Server-side karma logic, no client manipulation

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | NextAuth v4 |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Toasts | React Hot Toast |

---

## Folder Structure

```
sahayak-pustak/
├── db/
│   ├── schema.ts              # Drizzle schema (users, books, notes)
│   └── migrations/            # SQL migration files
├── scripts/
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── actions/               # Server Actions
│   │   ├── books.ts           # Book CRUD + karma
│   │   ├── notes.ts           # Notes CRUD + karma
│   │   └── leaderboard.ts     # Leaderboard queries
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── providers.tsx       # SessionProvider
│   │   ├── api/auth/           # NextAuth route handler
│   │   ├── auth/login/         # Login page
│   │   ├── books/              # Books listing + detail
│   │   ├── notes/              # Notes listing
│   │   ├── leaderboard/        # Karma leaderboard
│   │   ├── dashboard/          # User dashboard
│   │   └── upload/             # Upload book/note forms
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── books/              # BookCard, BookFilters, Skeleton
│   │   ├── notes/              # NoteCard, NotesFilters
│   │   └── ui/                 # EmptyState, shared UI
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── lib/
│   │   ├── db.ts               # Drizzle DB client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── supabase.ts         # Supabase storage client
│   │   └── utils.ts            # Helpers, constants
│   └── types/
│       └── next-auth.d.ts      # Session type augmentation
├── .env.example
├── drizzle.config.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd sahayak-pustak
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set Up PostgreSQL

You can use:
- **Local PostgreSQL**: `createdb sahayak_pustak`
- **Supabase** (recommended): Create a project at https://supabase.com and use the connection string from Settings > Database
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

```bash
# Run migrations
npm run db:migrate
# OR push schema directly (for dev)
npm run db:push
```

### 4. Set Up Supabase Storage

1. Go to your Supabase project → Storage
2. Create two buckets:
   - `book-images` (Public)
   - `note-pdfs` (Public)
3. Set bucket policies to allow public reads:

```sql
-- In Supabase SQL Editor, for each bucket:
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('book-images', 'note-pdfs'));

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('book-images', 'note-pdfs')
    AND auth.role() = 'authenticated'
  );
```

> **Note**: Since we use the service role key for server-side uploads, the RLS policies above are for direct client access. The server action bypasses RLS using the service role key.

### 5. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable "Google+ API" or "Google Identity"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### 6. Seed Demo Data (Optional)

```bash
npm run db:seed
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

### Users
```sql
id UUID PK | name | email UNIQUE | image
karma_points DEFAULT 0 | total_books_donated DEFAULT 0
total_notes_uploaded DEFAULT 0 | created_at
```

### Books
```sql
id UUID PK | title | author | subject | semester
condition ENUM(new, good, fair) | price | image_url
is_donation BOOLEAN | seller_id FK(users) | created_at
```

### Notes
```sql
id UUID PK | title | subject | semester | description
file_url | uploader_id FK(users) | download_count | created_at
```

---

## Karma Rules

| Action | Karma Earned |
|--------|-------------|
| Donate a book | +300 |
| Upload notes | +50 |
| Sell a book | 0 |

> Karma is **only** awarded via server actions. No client-side manipulation possible.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with stats |
| `/books` | Browse books (buy tab + donations tab) |
| `/books/[id]` | Book detail with seller contact |
| `/books/donations` | Redirects to `/books?tab=donations` |
| `/notes` | Browse and download free notes |
| `/upload/book` | List or donate a book |
| `/upload/note` | Upload PDF notes |
| `/leaderboard` | Public karma leaderboard |
| `/dashboard` | User profile and activity |
| `/auth/login` | Sign in with Google or email |

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` (use Neon or Supabase Postgres for serverless compatibility)
- `NEXTAUTH_URL` → your production URL
- `NEXTAUTH_SECRET` → generate with `openssl rand -base64 32`
- All other env vars from `.env.example`

### Update Google OAuth for Production

Add to authorized redirect URIs:
```
https://your-domain.com/api/auth/callback/google
```

### Run Migrations in Production

```bash
DATABASE_URL=your-prod-url npm run db:migrate
```

---

## Drizzle Studio (DB GUI)

```bash
npm run db:studio
```

---

## Security Notes

- All form validation happens on the server via Zod
- Karma points are only modified in server actions
- File uploads are validated (type + size) server-side
- Protected routes redirect to login
- Supabase service role key is **server-only** (never exposed to client)

---

## License

MIT — Built for University of Mumbai students 🎓
