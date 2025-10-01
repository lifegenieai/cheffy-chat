-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- Basic info
  servings INTEGER,
  
  -- Equipment and preferences stored as JSONB
  equipment JSONB DEFAULT '{}'::jsonb,
  cuisines TEXT[] DEFAULT ARRAY[]::TEXT[],
  flavors TEXT[] DEFAULT ARRAY[]::TEXT[],
  comfort_foods TEXT[] DEFAULT ARRAY[]::TEXT[],
  dislikes TEXT[] DEFAULT ARRAY[]::TEXT[],
  dietary_filter TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();