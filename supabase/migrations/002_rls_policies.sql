-- Row Level Security (RLS) Policies
-- Multi-tenant isolation for SPOTTER

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from Clerk user ID
-- This function safely retrieves the user_id from the users table based on clerk_user_id
-- Returns NULL if the setting is not set or user doesn't exist
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users 
  WHERE clerk_user_id = current_setting('app.current_user_id', true)
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Note: RLS policies use current_setting('app.current_user_id') which must be set
-- by the application layer when making database queries via the Supabase client.
-- The app will set this using: 
--   await supabase.rpc('set_user_context', { clerk_user_id: userId })
-- OR directly: SET app.current_user_id = 'clerk_user_id_here'
--
-- For server-side API routes using service role key, RLS is bypassed and
-- authorization is handled in the application layer (API routes).

-- Users table policies
-- Users can only see and update their own record
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (
    clerk_user_id = current_setting('app.current_user_id', true) 
    AND current_setting('app.current_user_id', true) IS NOT NULL
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (
    clerk_user_id = current_setting('app.current_user_id', true) 
    AND current_setting('app.current_user_id', true) IS NOT NULL
  );

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (
    clerk_user_id = current_setting('app.current_user_id', true) 
    AND current_setting('app.current_user_id', true) IS NOT NULL
  );

-- Clients table policies
-- Trainers can only see their own clients
CREATE POLICY "Trainers can view own clients"
  ON clients FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND trainer_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can create own clients"
  ON clients FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND trainer_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can update own clients"
  ON clients FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND trainer_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can delete own clients"
  ON clients FOR DELETE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND trainer_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Packages table policies
-- Trainers can only access packages for their clients
CREATE POLICY "Trainers can view own client packages"
  ON packages FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can create packages for own clients"
  ON packages FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can update packages for own clients"
  ON packages FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Workouts table policies
-- Trainers can only access workouts for their clients
CREATE POLICY "Trainers can view own client workouts"
  ON workouts FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can create workouts for own clients"
  ON workouts FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can update workouts for own clients"
  ON workouts FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can delete workouts for own clients"
  ON workouts FOR DELETE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Exercises table policies
-- Trainers can access exercises for their client workouts
CREATE POLICY "Trainers can view exercises for own client workouts"
  ON exercises FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND workout_id IN (
      SELECT w.id FROM workouts w
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can create exercises for own client workouts"
  ON exercises FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND workout_id IN (
      SELECT w.id FROM workouts w
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can update exercises for own client workouts"
  ON exercises FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND workout_id IN (
      SELECT w.id FROM workouts w
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can delete exercises for own client workouts"
  ON exercises FOR DELETE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND workout_id IN (
      SELECT w.id FROM workouts w
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Exercise logs table policies
-- Trainers can access logs for their client exercises
CREATE POLICY "Trainers can view exercise logs for own clients"
  ON exercise_logs FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workouts w ON e.workout_id = w.id
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Trainers can create exercise logs for own clients"
  ON exercise_logs FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workouts w ON e.workout_id = w.id
      JOIN clients c ON w.client_id = c.id
      JOIN users u ON c.trainer_id = u.id
      WHERE u.clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Subscriptions table policies
-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND user_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND user_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IS NOT NULL
    AND user_id IN (
      SELECT id FROM users 
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

