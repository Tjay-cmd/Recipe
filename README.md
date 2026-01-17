# Recipe Website MVP

A Next.js recipe website that converts Pinterest traffic into recurring visitors, email subscribers, and future Pro subscriptions.

## Features

- **SEO-Optimized**: Dynamic sitemap, robots.txt, structured data (Recipe schema JSON-LD)
- **Mobile-First**: Responsive design with touch-friendly interfaces
- **Pro Content Gating**: Free recipes with Pro features (meal plans, grocery lists, etc.)
- **Admin Interface**: Easy recipe creation without coding
- **Email Capture**: Built-in email subscription system
- **Recipe Management**: Save favorites, search, filter by tags
- **Stripe Ready**: UI structure for future subscription integration

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) Stripe account for future subscription integration

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor
3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_EMAILS=your-email@example.com

# Stripe Configuration (Optional - for future use)
ENABLE_STRIPE_CHECKOUT=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace `your-email@example.com` with your actual email address to access the admin panel.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding Recipes (Admin)

1. Sign up or log in with the email address you added to `ADMIN_EMAILS`
2. Navigate to `/admin`
3. Fill out the recipe form:
   - Title (slug auto-generates)
   - Description
   - Cover image URL
   - Ingredients (add multiple)
   - Steps (add multiple)
   - Prep/cook time, servings, difficulty
   - Tags (comma-separated)
   - Pro toggle (if recipe requires subscription)
4. Click "Create Recipe"

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (main)/            # Public pages (home, recipes, pro)
│   ├── admin/             # Admin recipe management
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and clients
│   ├── supabase/         # Supabase client setup
│   └── stripe/           # Stripe config (feature flag)
├── types/                 # TypeScript type definitions
└── supabase/             # Database migrations
```

## Key Pages

- `/` - Home page with trending and latest recipes
- `/recipes` - All recipes with search and filters
- `/recipes/[slug]` - Individual recipe page
- `/tag/[tag]` - Recipes filtered by tag
- `/pro` - Pro subscription landing page
- `/account` - User account and saved recipes
- `/admin` - Recipe creation/editing (admin only)
- `/login` - User login
- `/signup` - User registration

## Database Schema

### Tables

- **recipes**: Recipe data (title, slug, ingredients, steps, etc.)
- **favorites**: User saved recipes
- **profiles**: User profile information
- **email_subscribers**: Email capture list
- **subscriptions**: Stripe subscription data (for future use)

See `supabase/migrations/001_initial_schema.sql` for full schema.

## SEO Features

- Dynamic sitemap (`/sitemap.xml`)
- Robots.txt (`/robots.txt`)
- Recipe schema JSON-LD on recipe pages
- OpenGraph and Twitter Card metadata
- Canonical URLs

## Stripe Integration (Future)

The Stripe integration is structured but disabled by default. To enable:

1. Add Stripe API keys to `.env.local`
2. Set `ENABLE_STRIPE_CHECKOUT=true`
3. Implement checkout session creation in `components/ProCheckoutButton.tsx`
4. Add webhook handler for subscription updates

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - All variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Deploy

### Vercel Environment Variables

Add these in Vercel Dashboard > Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Admin Access

To access the admin panel (`/admin`):

1. Sign up/login with an email address
2. Add that email to `ADMIN_EMAILS` environment variable (comma-separated for multiple admins)
3. Refresh the page

## Troubleshooting

### "Unauthorized" when accessing admin

- Make sure your email is in `ADMIN_EMAILS` environment variable
- Restart the dev server after changing environment variables
- Check that you're logged in with the correct email

### Recipes not showing

- Verify Supabase connection (check environment variables)
- Run the migration SQL in Supabase
- Check browser console for errors

### Images not loading

- Ensure image URLs are publicly accessible
- Check `next.config.js` for remote pattern configuration
- Verify Supabase storage bucket settings if using Supabase storage

## Future Enhancements

- Stripe checkout integration
- Meal planning features
- Grocery list generation
- Macro counting
- PDF recipe downloads
- Affiliate link management
- Recipe collections/organization

## License

MIT
