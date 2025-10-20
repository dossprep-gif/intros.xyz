# Supabase Setup Guide for intros.xyz

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `intros-xyz`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### 2. Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string starting with `eyJ`)

### 3. Set Up Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

**⚠️ Important:** If you already have the basic schema set up, you only need to run the new parts for the friends system. The updated schema includes:
- New `friends` table
- Additional RLS policies for friends
- Updated user policies to allow profile viewing

### 5. Configure Authentication
1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **General Settings**:
   - Enable **Enable email confirmations** (optional for development)
   - Set **Site URL** to `http://localhost:3000` (for development)
3. Under **Email Templates**, you can customize the signup/forgot password emails

### 6. Set Up Storage (Profile Pictures)
1. In your Supabase dashboard, go to **Storage**
2. The `profile-pictures` bucket should be automatically created by the schema
3. If you see "Bucket not found" errors, manually create the bucket:
   - Click **"New bucket"**
   - **Name**: `profile-pictures`
   - **Public**: ✅ (checked)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
4. The storage policies are automatically configured by the schema
5. If you still have issues, run the SQL schema again to ensure all policies are created

### 7. Test the Integration
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000`
3. Try signing up with a new account
4. Check your Supabase dashboard to see the user created
5. Test uploading a profile picture in the edit profile page

## 🔧 What's Already Set Up

✅ **Supabase Client Configuration** - Ready to connect
✅ **Database Schema** - Users and introductions tables
✅ **Authentication Components** - Sign up/sign in modals
✅ **Security Policies** - Row Level Security enabled
✅ **Data Validation** - Input sanitization and validation
✅ **Migration Service** - Helper to move localStorage data
✅ **Profile Picture Upload** - Image upload with Supabase Storage

## 📋 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `name` (Text)
- `position`, `location`, `bio`, `education` (Text, Optional)
- `expertise`, `hobbies`, `adjectives` (Text Arrays)
- `social_links` (JSONB for flexible social media links)
- `profile_picture_url` (Text, Optional - URL to uploaded profile picture)
- `created_at`, `updated_at` (Timestamps)

### Introductions Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `person_a_name`, `person_a_email`, `person_a_phone`
- `person_b_name`, `person_b_email`, `person_b_phone`
- `notes` (Text, Optional)
- `verified` (Boolean, Default: false)
- `date` (Date)
- `created_at`, `updated_at` (Timestamps)

### Friends Table (NEW)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `friend_id` (UUID, Foreign Key to users)
- `status` (Text: 'pending', 'accepted', 'blocked')
- `created_at`, `updated_at` (Timestamps)
- Unique constraint on (user_id, friend_id)

## 🔒 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Input Validation** - All user inputs are validated and sanitized
- **Rate Limiting** - Prevents abuse of localStorage operations
- **Secure Headers** - Already configured in Next.js
- **Storage Security** - Profile pictures are organized by user ID with proper access controls
- **Friends System Security** - Users can only manage their own friend relationships

## 🚨 Next Steps After Setup

1. **Test Authentication Flow**
2. **Test Data Operations** (CRUD for introductions)
3. **Test Friends System** (Add friends, manage requests)
4. **Test Profile Sharing** (View other users' profiles)
5. **Set up Production Environment**
6. **Configure Domain Settings**
7. **Deploy to Vercel/Netlify**

## 🚀 Production Deployment Checklist

### ✅ **Pre-Deployment Requirements**

- [ ] **Supabase Database Setup**
  - [ ] Run the updated `supabase-schema.sql` in your Supabase project
  - [ ] Verify all tables and policies are created correctly
  - [ ] Test authentication and data operations

- [ ] **Environment Variables**
  - [ ] Set `NEXT_PUBLIC_SUPABASE_URL` to your production Supabase URL
  - [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your production anon key
  - [ ] Verify environment variables are properly configured

- [ ] **Security Configuration**
  - [ ] Content Security Policy headers are configured
  - [ ] Security headers are enabled in `next.config.ts`
  - [ ] Row Level Security (RLS) is enabled on all tables
  - [ ] Input validation is working correctly

- [ ] **Legal Pages**
  - [ ] Privacy Policy is updated and accessible at `/privacy`
  - [ ] Terms of Service is updated and accessible at `/terms`
  - [ ] Contact page is functional at `/contact`

- [ ] **SEO & Performance**
  - [ ] Meta tags are configured in `layout.tsx`
  - [ ] Sitemap.xml is updated and accessible
  - [ ] Robots.txt is configured correctly
  - [ ] PWA manifest is configured

### 🎯 **Deployment Steps**

1. **Deploy to Vercel** (Recommended)
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure Domain**
   - [ ] Point your domain to Vercel
   - [ ] Update Supabase Site URL to your production domain
   - [ ] Update redirect URLs in Supabase Auth settings

3. **Post-Deployment Testing**
   - [ ] Test user registration and login
   - [ ] Test profile creation and editing
   - [ ] Test friend system functionality
   - [ ] Test introduction tracking
   - [ ] Test profile sharing
   - [ ] Verify all pages load correctly

### 🔒 **Security Verification**

- [ ] HTTPS is enabled and working
- [ ] Security headers are present
- [ ] CSP is not blocking legitimate requests
- [ ] Authentication is working correctly
- [ ] Data isolation is working (users can only see their own data)
- [ ] File uploads are secure and working

## 🆘 Troubleshooting

### Common Issues:

**"Invalid API key"**
- Check your `.env.local` file has the correct values
- Ensure no extra spaces or quotes around the values

**"User not found"**
- Check if the database schema was created successfully
- Verify the trigger function for new user creation

**"Permission denied"**
- Check Row Level Security policies are enabled
- Verify the user is properly authenticated

**"Bucket not found"**
- Go to Storage in your Supabase dashboard
- Create the `profile-pictures` bucket manually if it doesn't exist
- Ensure the bucket is set to public
- Re-run the SQL schema to create storage policies

**"Invalid user data"**
- This usually means the profile picture URL validation failed
- Check that the uploaded image URL is valid
- Try uploading a different image file

### Getting Help:
- Check Supabase logs in the dashboard
- Review browser console for client-side errors
- Ensure all environment variables are set correctly

## 🎉 Success!

Once you complete these steps, your app will have:
- Real user authentication
- Persistent data storage
- Secure user data isolation
- Scalable database backend
- Friends system with friend requests
- Profile sharing capabilities
- Enhanced introduction cards with profile pictures

Ready to launch! 🚀
