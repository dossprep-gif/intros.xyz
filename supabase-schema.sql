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
