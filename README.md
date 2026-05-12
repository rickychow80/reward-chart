# Reward Chart

A kids reward stamp chart PWA built for family use. Children collect stamps for good behaviour, and when they hit the goal they spin a wheel to win a prize.

## Features

- **Stamp chart** — 5×5 grid, each stamp can have a custom emoji icon
- **Spin the wheel** — weighted prize wheel with confetti celebration
- **Multiple children** — each with a custom avatar photo, colour, and profile
- **4 themes** — Bright, Pastel, Space, Nature, Ocean, Candy, Sunset, Midnight
- **Bilingual** — English and Traditional Chinese (繁體中文)
- **Parent PIN** — protects settings from little fingers
- **PWA** — installs on iPhone/iPad home screen via Safari, no App Store needed
- **Hidden stamp delete** — tap a stamp 10 times to remove it (PIN required)

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + Auth + Storage) |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/rickychow80/reward-chart.git
cd reward-chart
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:

```bash
cat supabase/migrations/001_initial.sql
```

3. Run these additional migrations for avatar support:

```sql
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_position TEXT DEFAULT '50% 50%';
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_zoom FLOAT DEFAULT 1.0;
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS stamp_icon TEXT DEFAULT '⭐';
ALTER TABLE spin_history ADD COLUMN IF NOT EXISTS stamps_consumed INTEGER DEFAULT 10;
```

4. Create a **Storage bucket** named `avatars` (public) and add these policies:

```sql
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');
```

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001), create your parent account, and start adding children.

## Deploy to Vercel

```bash
npx vercel --prod
```

Add the same environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

## Install on iPhone

1. Open your Vercel URL in **Safari**
2. Tap **Share → Add to Home Screen**
3. The app appears on your home screen like a native app

## Settings

| Page | Description |
|---|---|
| Children | Add kids, upload avatar photo, pick colour |
| Wheel Rewards | Add prizes, set stamp goal |
| Tasks | What earns a stamp |
| Style | App theme |
| PIN | Change 4-digit parent PIN |
| Language | English / 繁體中文 |

Default PIN: `1234`
