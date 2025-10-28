/*
  # Fix RLS Performance - Part 1: Policies Only
  
  Replace auth.uid() with (select auth.uid()) in all RLS policies
  Remove duplicate policies
*/

-- Masters table
DROP POLICY IF EXISTS "masters_insert_policy" ON masters;
DROP POLICY IF EXISTS "masters_update_policy" ON masters;
DROP POLICY IF EXISTS "masters_select_own" ON masters;
DROP POLICY IF EXISTS "masters_select_public" ON masters;

DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON masters;
CREATE POLICY "Authenticated users can view their own profile"
  ON masters FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON masters;
CREATE POLICY "Authenticated users can insert their own profile"
  ON masters FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON masters;
CREATE POLICY "Authenticated users can update their own profile"
  ON masters FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Master portfolio
DROP POLICY IF EXISTS "Masters can manage own portfolio" ON master_portfolio;
CREATE POLICY "Masters can manage own portfolio"
  ON master_portfolio FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_portfolio.master_id AND masters.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_portfolio.master_id AND masters.user_id = (select auth.uid())));

-- Master reviews
DROP POLICY IF EXISTS "Clients can insert reviews with restrictions" ON master_reviews;
CREATE POLICY "Clients can insert reviews with restrictions"
  ON master_reviews FOR INSERT TO authenticated
  WITH CHECK (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Clients can update their own reviews" ON master_reviews;
CREATE POLICY "Clients can update their own reviews"
  ON master_reviews FOR UPDATE TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Clients can delete their own reviews" ON master_reviews;
CREATE POLICY "Clients can delete their own reviews"
  ON master_reviews FOR DELETE TO authenticated
  USING (client_id = (select auth.uid()));

-- Master availability
DROP POLICY IF EXISTS "Masters can insert own availability" ON master_availability;
CREATE POLICY "Masters can insert own availability"
  ON master_availability FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_availability.master_id AND masters.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Masters can update own availability" ON master_availability;
CREATE POLICY "Masters can update own availability"
  ON master_availability FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_availability.master_id AND masters.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_availability.master_id AND masters.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Masters can delete own availability" ON master_availability;
CREATE POLICY "Masters can delete own availability"
  ON master_availability FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_availability.master_id AND masters.user_id = (select auth.uid())));

-- Subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Payment history
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
CREATE POLICY "Users can view own payment history"
  ON payment_history FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own payment records" ON payment_history;
CREATE POLICY "Users can create own payment records"
  ON payment_history FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Master contact hours
DROP POLICY IF EXISTS "Masters can insert their own contact hours" ON master_contact_hours;
CREATE POLICY "Masters can insert their own contact hours"
  ON master_contact_hours FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_contact_hours.master_id AND masters.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Masters can update their own contact hours" ON master_contact_hours;
CREATE POLICY "Masters can update their own contact hours"
  ON master_contact_hours FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_contact_hours.master_id AND masters.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_contact_hours.master_id AND masters.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Masters can delete their own contact hours" ON master_contact_hours;
CREATE POLICY "Masters can delete their own contact hours"
  ON master_contact_hours FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_contact_hours.master_id AND masters.user_id = (select auth.uid())));

-- Master projects (remove duplicates)
DROP POLICY IF EXISTS "Masters can create own projects" ON master_projects;
DROP POLICY IF EXISTS "Masters can insert own projects" ON master_projects;
CREATE POLICY "Masters can manage own projects"
  ON master_projects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_projects.master_id AND masters.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM masters WHERE masters.id = master_projects.master_id AND masters.user_id = (select auth.uid())));

-- Project tasks (remove duplicates)
DROP POLICY IF EXISTS "Masters can create own project tasks" ON project_tasks;
DROP POLICY IF EXISTS "Masters can insert own project tasks" ON project_tasks;
CREATE POLICY "Masters can manage own project tasks"
  ON project_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM master_projects mp JOIN masters m ON m.id = mp.master_id WHERE mp.id = project_tasks.project_id AND m.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM master_projects mp JOIN masters m ON m.id = mp.master_id WHERE mp.id = project_tasks.project_id AND m.user_id = (select auth.uid())));