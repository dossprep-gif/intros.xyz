-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  location TEXT,
  bio TEXT,
  education TEXT,
  expertise TEXT[],
  hobbies TEXT[],
  adjectives TEXT[],
  social_links JSONB DEFAULT '{}',
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create introductions table
CREATE TABLE IF NOT EXISTS public.introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  person_a_name TEXT NOT NULL,
  person_a_email TEXT,
  person_a_phone TEXT,
  person_b_name TEXT NOT NULL,
  person_b_email TEXT,
  person_b_phone TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table for friend relationships
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to view other users' profiles (for friend system)
CREATE POLICY "Users can view other profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only access their own introductions
CREATE POLICY "Users can view own introductions" ON public.introductions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own introductions" ON public.introductions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own introductions" ON public.introductions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own introductions" ON public.introductions
  FOR DELETE USING (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view their own friend relationships" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend relationships" ON public.friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friend relationships" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_introductions_updated_at BEFORE UPDATE ON public.introductions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for startup logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('startup-logos', 'startup-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create activities table for tracking networking activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'coffee', 'lunch', 'dinner', 'golf', 'tennis', 'hiking', 'event', 
    'conference', 'meeting', 'phone_call', 'video_call', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  participants JSONB DEFAULT '[]', -- Array of participant objects with name, email, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity participants table for more detailed tracking
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Can be null for external participants
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT,
  is_external BOOLEAN DEFAULT TRUE, -- True if not a registered user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activities tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Users can view their own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON public.activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON public.activities
  FOR DELETE USING (auth.uid() = user_id);

-- Allow users to view activities of their friends (for networking insights)
CREATE POLICY "Users can view friends' activities" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.friends 
      WHERE (user_id = auth.uid() AND friend_id = activities.user_id) 
         OR (friend_id = auth.uid() AND user_id = activities.user_id)
      AND status = 'accepted'
    )
  );

-- Activity participants policies
CREATE POLICY "Users can view participants of their activities" ON public.activity_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE activities.id = activity_participants.activity_id 
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants to their activities" ON public.activity_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE activities.id = activity_participants.activity_id 
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants of their activities" ON public.activity_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE activities.id = activity_participants.activity_id 
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete participants of their activities" ON public.activity_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE activities.id = activity_participants.activity_id 
      AND activities.user_id = auth.uid()
    )
  );

-- Create triggers for activities updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Storage policies for startup logos
CREATE POLICY "Startup logos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'startup-logos');

CREATE POLICY "Authenticated users can upload startup logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'startup-logos' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update startup logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'startup-logos' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete startup logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'startup-logos' AND 
    auth.uid() IS NOT NULL
  );

-- Create startups table
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  linkedin_url TEXT,
  careers_url TEXT,
  industry TEXT,
  location TEXT,
  founded_date DATE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funding_rounds table
CREATE TABLE IF NOT EXISTS public.funding_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('seed', 'series_a', 'series_b', 'series_c', 'series_d', 'series_e', 'pre_seed', 'bridge', 'convertible_note', 'other')),
  amount_raised BIGINT, -- Amount in cents to avoid floating point issues
  currency TEXT DEFAULT 'USD',
  date DATE NOT NULL,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investors table
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('vc_firm', 'angel', 'corporate', 'government', 'other')),
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funding_round_investors junction table
CREATE TABLE IF NOT EXISTS public.funding_round_investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funding_round_id UUID REFERENCES public.funding_rounds(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
  is_lead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(funding_round_id, investor_id)
);

-- Enable RLS on startup tables
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_round_investors ENABLE ROW LEVEL SECURITY;

-- Only approved startups are publicly viewable
CREATE POLICY "Approved startups are publicly viewable" ON public.startups
  FOR SELECT USING (status = 'approved');

-- Users can view their own submitted startups
CREATE POLICY "Users can view their own submitted startups" ON public.startups
  FOR SELECT USING (auth.uid() = submitted_by);

-- Allow authenticated users to submit startups (pending status)
CREATE POLICY "Authenticated users can submit startups" ON public.startups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own pending startups
CREATE POLICY "Users can update their own pending startups" ON public.startups
  FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending');

-- Users can delete their own pending startups
CREATE POLICY "Users can delete their own pending startups" ON public.startups
  FOR DELETE USING (auth.uid() = submitted_by AND status = 'pending');

-- Admin users can view all startups (for approval)
CREATE POLICY "Admin users can view all startups" ON public.startups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'introsxyzteam@gmail.com' -- Your admin email
    )
  );

-- Admin users can update startup status
CREATE POLICY "Admin users can update startup status" ON public.startups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'introsxyzteam@gmail.com' -- Your admin email
    )
  );

-- Funding rounds are publicly viewable
CREATE POLICY "Funding rounds are publicly viewable" ON public.funding_rounds
  FOR SELECT USING (true);

-- Allow authenticated users to manage funding rounds
CREATE POLICY "Authenticated users can insert funding rounds" ON public.funding_rounds
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update funding rounds" ON public.funding_rounds
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete funding rounds" ON public.funding_rounds
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Investors are publicly viewable
CREATE POLICY "Investors are publicly viewable" ON public.investors
  FOR SELECT USING (true);

-- Allow authenticated users to manage investors
CREATE POLICY "Authenticated users can insert investors" ON public.investors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update investors" ON public.investors
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete investors" ON public.investors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Funding round investors are publicly viewable
CREATE POLICY "Funding round investors are publicly viewable" ON public.funding_round_investors
  FOR SELECT USING (true);

-- Allow authenticated users to manage funding round investors
CREATE POLICY "Authenticated users can insert funding round investors" ON public.funding_round_investors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update funding round investors" ON public.funding_round_investors
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete funding round investors" ON public.funding_round_investors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create triggers for startup tables updated_at
CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funding_rounds_updated_at BEFORE UPDATE ON public.funding_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
