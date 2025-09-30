/*
  # Master Projects Management

  1. New Tables
    - `master_projects`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to masters table)
      - `name` (text, project name)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `project_tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to master_projects)
      - `phase` (text, one of: 'priprava', 'realizacia', 'ukoncenie')
      - `text` (text, task description)
      - `completed` (boolean, task completion status)
      - `order_index` (integer, for ordering tasks)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Masters can only manage their own projects and tasks
    - No public access to project data (private to master only)

  3. Indexes
    - Index on `master_id` for fast project lookups
    - Index on `project_id` for fast task lookups
    - Composite index on `project_id` and `phase` for phase-based queries

  4. Constraints
    - Limit: 20 projects per master
    - Limit: 10 tasks per phase per project
*/

-- Create master_projects table
CREATE TABLE IF NOT EXISTS master_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES master_projects(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('priprava', 'realizacia', 'ukoncenie')),
  text text NOT NULL,
  completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_projects_master_id ON master_projects(master_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_phase ON project_tasks(project_id, phase);

-- Enable RLS
ALTER TABLE master_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- DROP old policies if they exist
DROP POLICY IF EXISTS "Masters can view own projects" ON master_projects;
DROP POLICY IF EXISTS "Masters can insert own projects" ON master_projects;
DROP POLICY IF EXISTS "Masters can update own projects" ON master_projects;
DROP POLICY IF EXISTS "Masters can delete own projects" ON master_projects;
DROP POLICY IF EXISTS "Masters can view own project tasks" ON project_tasks;
DROP POLICY IF EXISTS "Masters can insert own project tasks" ON project_tasks;
DROP POLICY IF EXISTS "Masters can update own project tasks" ON project_tasks;
DROP POLICY IF EXISTS "Masters can delete own project tasks" ON project_tasks;

-- Policies for master_projects table

-- Policy: Masters can view their own projects
CREATE POLICY "Masters can view own projects"
  ON master_projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_projects.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Policy: Masters can insert their own projects (with limit check)
CREATE POLICY "Masters can insert own projects"
  ON master_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_projects.master_id
      AND masters.user_id = auth.uid()
    )
    AND (
      SELECT COUNT(*) FROM master_projects mp
      WHERE mp.master_id = master_projects.master_id
    ) < 20
  );

-- Policy: Masters can update their own projects
CREATE POLICY "Masters can update own projects"
  ON master_projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_projects.master_id
      AND masters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_projects.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Policy: Masters can delete their own projects
CREATE POLICY "Masters can delete own projects"
  ON master_projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_projects.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Policies for project_tasks table

-- Policy: Masters can view tasks from their projects
CREATE POLICY "Masters can view own project tasks"
  ON project_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM master_projects mp
      JOIN masters m ON m.id = mp.master_id
      WHERE mp.id = project_tasks.project_id
      AND m.user_id = auth.uid()
    )
  );

-- Policy: Masters can insert tasks to their projects (with limit check)
CREATE POLICY "Masters can insert own project tasks"
  ON project_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM master_projects mp
      JOIN masters m ON m.id = mp.master_id
      WHERE mp.id = project_tasks.project_id
      AND m.user_id = auth.uid()
    )
    AND (
      SELECT COUNT(*) FROM project_tasks pt
      WHERE pt.project_id = project_tasks.project_id
      AND pt.phase = project_tasks.phase
    ) < 10
  );

-- Policy: Masters can update tasks in their projects
CREATE POLICY "Masters can update own project tasks"
  ON project_tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM master_projects mp
      JOIN masters m ON m.id = mp.master_id
      WHERE mp.id = project_tasks.project_id
      AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM master_projects mp
      JOIN masters m ON m.id = mp.master_id
      WHERE mp.id = project_tasks.project_id
      AND m.user_id = auth.uid()
    )
  );

-- Policy: Masters can delete tasks from their projects
CREATE POLICY "Masters can delete own project tasks"
  ON project_tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM master_projects mp
      JOIN masters m ON m.id = mp.master_id
      WHERE mp.id = project_tasks.project_id
      AND m.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp for master_projects
CREATE OR REPLACE FUNCTION update_master_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp for project_tasks
CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for master_projects
DROP TRIGGER IF EXISTS master_projects_updated_at ON master_projects;
CREATE TRIGGER master_projects_updated_at
  BEFORE UPDATE ON master_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_master_projects_updated_at();

-- Trigger to automatically update updated_at for project_tasks
DROP TRIGGER IF EXISTS project_tasks_updated_at ON project_tasks;
CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_tasks_updated_at();
