# Supabase Setup Guide

Follow these steps to set up Supabase for your recipe website.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `recipe-website` (or any name you prefer)
   - **Database Password**: Create a strong password (save this somewhere safe!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is fine for MVP
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Run the Database Migration

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy **ALL** the contents of that file
5. Paste it into the SQL Editor in Supabase
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see "Success. No rows returned" - this means it worked!

**What this does:**
- Creates all the database tables (recipes, favorites, profiles, etc.)
- Sets up indexes for fast queries
- Configures Row Level Security (RLS) policies
- Creates triggers for automatic timestamp updates

## Step 4: Get Your API Keys

1. In the Supabase dashboard, click **"Project Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. You'll see several important values:

   **Project URL**
   - Copy the "Project URL" (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

   **API Keys**
   - **anon/public key**: This is the `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Copy the "anon" or "public" key (starts with `eyJ...`)
   - **service_role key**: This is the `SUPABASE_SERVICE_ROLE_KEY`
     - Copy the "service_role" key (starts with `eyJ...`)
     - ⚠️ **Important**: Keep this secret! Never commit it to Git.

## Step 5: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Copy the template below and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Configuration
ADMIN_EMAILS=your-email@example.com

# Stripe Configuration (Optional - leave as is for now)
ENABLE_STRIPE_CHECKOUT=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Replace:
   - `NEXT_PUBLIC_SUPABASE_URL` with your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` with your service_role key
   - `ADMIN_EMAILS` with your email address (the one you'll use to log in)

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.example
ADMIN_EMAILS=youremail@gmail.com
```

## Step 6: Enable Email Authentication (Optional but Recommended)

1. In Supabase dashboard, go to **"Authentication"** > **"Providers"**
2. Make sure **"Email"** is enabled (it should be by default)
3. For development, you can use the built-in email templates
4. For production, you'll want to configure SMTP settings later

## Step 7: Test Your Setup

1. Make sure you've saved `.env.local` with all the correct values
2. In your terminal, run:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)
4. Try signing up for an account (use the email you added to `ADMIN_EMAILS`)
5. After signing up, you should be able to access `/admin` to add recipes

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the keys correctly (no extra spaces)
- Make sure you're using the right key (anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### "Unauthorized" when accessing `/admin`
- Make sure your email is in `ADMIN_EMAILS` in `.env.local`
- Restart your dev server after changing environment variables
- Make sure you're logged in with the correct email

### Database errors
- Make sure you ran the migration SQL successfully
- Check the Supabase dashboard > Table Editor to see if tables were created
- If tables are missing, re-run the migration SQL

### Can't sign up/login
- Check Authentication > Providers in Supabase dashboard
- Make sure Email provider is enabled
- Check the browser console for error messages

## Next Steps

Once Supabase is set up:
1. ✅ Test signing up and logging in
2. ✅ Access `/admin` and create your first recipe
3. ✅ View the recipe on the home page
4. ✅ Test saving recipes (favorites)
5. ✅ Test email subscription form

## Need Help?

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
