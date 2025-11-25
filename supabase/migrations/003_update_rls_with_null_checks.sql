-- Update RLS policies to include NULL checks for better security
-- This migration updates existing policies to ensure they fail safely when
-- app.current_user_id is not set

-- Drop existing policies and recreate with NULL checks
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Users table policies with NULL checks
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

-- Drop and recreate clients policies
DROP POLICY IF EXISTS "Trainers can view own clients" ON clients;
DROP POLICY IF EXISTS "Trainers can create own clients" ON clients;
DROP POLICY IF EXISTS "Trainers can update own clients" ON clients;
DROP POLICY IF EXISTS "Trainers can delete own clients" ON clients;

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

-- Drop and recreate packages policies
DROP POLICY IF EXISTS "Trainers can view own client packages" ON packages;
DROP POLICY IF EXISTS "Trainers can create packages for own clients" ON packages;
DROP POLICY IF EXISTS "Trainers can update packages for own clients" ON packages;

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

-- Drop and recreate workouts policies
DROP POLICY IF EXISTS "Trainers can view own client workouts" ON workouts;
DROP POLICY IF EXISTS "Trainers can create workouts for own clients" ON workouts;
DROP POLICY IF EXISTS "Trainers can update workouts for own clients" ON workouts;
DROP POLICY IF EXISTS "Trainers can delete workouts for own clients" ON workouts;

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

-- Drop and recreate exercises policies
DROP POLICY IF EXISTS "Trainers can view exercises for own client workouts" ON exercises;
DROP POLICY IF EXISTS "Trainers can create exercises for own client workouts" ON exercises;
DROP POLICY IF EXISTS "Trainers can update exercises for own client workouts" ON exercises;
DROP POLICY IF EXISTS "Trainers can delete exercises for own client workouts" ON exercises;

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

-- Drop and recreate exercise_logs policies
DROP POLICY IF EXISTS "Trainers can view exercise logs for own clients" ON exercise_logs;
DROP POLICY IF EXISTS "Trainers can create exercise logs for own clients" ON exercise_logs;

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

-- Drop and recreate subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

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

