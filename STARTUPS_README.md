# Startups Feature

This document describes the new Startups feature added to intros.xyz, which allows users to track startup funding rounds and company information.

## Overview

The Startups feature provides:
- A comprehensive table view of startups and their funding information
- Individual startup profile pages with detailed funding history
- Ability to add new startups and funding rounds
- Search and filtering capabilities
- Integration with the existing intros.xyz platform

## Database Schema

### Tables Added

1. **startups** - Core startup information
   - id, name, description, website_url, logo_url
   - industry, location, founded_date
   - created_at, updated_at

2. **funding_rounds** - Funding round details
   - id, startup_id, round_type, amount_raised, currency
   - date, source_url, notes
   - created_at, updated_at

3. **investors** - Investor information
   - id, name, type, website_url, description
   - created_at, updated_at

4. **funding_round_investors** - Junction table linking rounds to investors
   - id, funding_round_id, investor_id, is_lead
   - created_at

### Row Level Security (RLS)

- Startups, funding rounds, and investors are publicly viewable
- Only authenticated users can create, update, or delete records
- All operations require authentication

## Pages and Components

### 1. `/startups` - Main Startups Page
- **File**: `src/app/startups/page.tsx`
- **Features**:
  - Table view of all startups with latest funding information
  - Search functionality
  - Add startup button (authenticated users only)
  - Clickable company names leading to profile pages

### 2. `/startups/[startupId]` - Startup Profile Page
- **File**: `src/app/startups/[startupId]/page.tsx`
- **Features**:
  - Detailed startup information
  - Complete funding history
  - Investor information for each round
  - Links to funding sources

### 3. Add Startup Modal
- **File**: `src/components/AddStartupModal.tsx`
- **Features**:
  - Form for adding new startups
  - Optional funding round information
  - Investor management
  - Validation and error handling

## Navigation Updates

- Added "Startups" link to the main homepage header
- Maintains existing navigation structure
- Responsive design for mobile and desktop

## Usage

### For Users
1. Navigate to `/startups` to view the startups table
2. Use the search bar to filter companies
3. Click on company names to view detailed profiles
4. Authenticated users can add new startups via the "Add Startup" button

### For Developers
1. Run the database migration: `supabase-schema.sql`
2. Optionally seed with sample data: `node seed-startups.js`
3. The feature is fully integrated with the existing Supabase setup

## Sample Data

The `seed-startups.js` script includes sample data matching the design example:
- Unrivaled (Series B, $25M)
- The Clearing Company (Seed, $15M)
- Appcharge (Series B, $58M)
- Qloud Games (Series A, $5M)
- Jump (Series A, $23M)
- Novig (Series A, $18M)
- TeamLinkt (Series A, $6M)

## Future Enhancements

This foundation supports future features like:
- Career pages for each startup
- User following/subscription system
- Integration with the existing networking features
- Advanced analytics and insights
- API endpoints for external integrations

## Technical Notes

- Uses existing Supabase client configuration
- Maintains consistent styling with the main platform
- Responsive design with Tailwind CSS
- TypeScript interfaces for type safety
- Error handling and loading states
- Optimistic UI updates

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for seeding script)
