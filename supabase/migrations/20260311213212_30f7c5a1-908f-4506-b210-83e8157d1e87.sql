
-- Fix CRITICAL: Convert all RESTRICTIVE RLS policies to PERMISSIVE
-- This is needed because RESTRICTIVE policies without any PERMISSIVE policies means NO rows are returned

-- APPOINTMENTS
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
CREATE POLICY "Authenticated users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (barbershop_id = get_user_barbershop_id(auth.uid()));

DROP POLICY IF EXISTS "Owners and team can view appointments" ON public.appointments;
CREATE POLICY "Owners and team can view appointments" ON public.appointments FOR SELECT TO authenticated USING (barbershop_id = get_user_barbershop_id(auth.uid()));

DROP POLICY IF EXISTS "Team can delete appointments" ON public.appointments;
CREATE POLICY "Team can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (barbershop_id = get_user_barbershop_id(auth.uid()));

DROP POLICY IF EXISTS "Team can update appointments" ON public.appointments;
CREATE POLICY "Team can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- AUTOMATIONS
DROP POLICY IF EXISTS "Owners can manage automations" ON public.automations;
CREATE POLICY "Owners can manage automations" ON public.automations FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = automations.barbershop_id AND barbershops.owner_id = auth.uid()));

-- BARBERSHOPS
DROP POLICY IF EXISTS "Anyone can view barbershops" ON public.barbershops;
CREATE POLICY "Anyone can view barbershops" ON public.barbershops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can insert their barbershop" ON public.barbershops;
CREATE POLICY "Owners can insert their barbershop" ON public.barbershops FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their barbershop" ON public.barbershops;
CREATE POLICY "Owners can update their barbershop" ON public.barbershops FOR UPDATE USING (auth.uid() = owner_id);

-- BLOCKED_TIMES
DROP POLICY IF EXISTS "Anyone can view blocked times" ON public.blocked_times;
CREATE POLICY "Anyone can view blocked times" ON public.blocked_times FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete blocked times" ON public.blocked_times;
CREATE POLICY "Owners can delete blocked times" ON public.blocked_times FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = blocked_times.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert blocked times" ON public.blocked_times;
CREATE POLICY "Owners can insert blocked times" ON public.blocked_times FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = blocked_times.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update blocked times" ON public.blocked_times;
CREATE POLICY "Owners can update blocked times" ON public.blocked_times FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = blocked_times.barbershop_id AND barbershops.owner_id = auth.uid()));

-- CAMPAIGN_RECIPIENTS
DROP POLICY IF EXISTS "Owners can delete campaign recipients" ON public.campaign_recipients;
CREATE POLICY "Owners can delete campaign recipients" ON public.campaign_recipients FOR DELETE USING (EXISTS (SELECT 1 FROM campaigns c JOIN barbershops b ON b.id = c.barbershop_id WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert campaign recipients" ON public.campaign_recipients;
CREATE POLICY "Owners can insert campaign recipients" ON public.campaign_recipients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM campaigns c JOIN barbershops b ON b.id = c.barbershop_id WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update campaign recipients" ON public.campaign_recipients;
CREATE POLICY "Owners can update campaign recipients" ON public.campaign_recipients FOR UPDATE USING (EXISTS (SELECT 1 FROM campaigns c JOIN barbershops b ON b.id = c.barbershop_id WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view campaign recipients" ON public.campaign_recipients;
CREATE POLICY "Owners can view campaign recipients" ON public.campaign_recipients FOR SELECT USING (EXISTS (SELECT 1 FROM campaigns c JOIN barbershops b ON b.id = c.barbershop_id WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()));

-- CAMPAIGNS
DROP POLICY IF EXISTS "Owners can delete campaigns" ON public.campaigns;
CREATE POLICY "Owners can delete campaigns" ON public.campaigns FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert campaigns" ON public.campaigns;
CREATE POLICY "Owners can insert campaigns" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update campaigns" ON public.campaigns;
CREATE POLICY "Owners can update campaigns" ON public.campaigns FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view their campaigns" ON public.campaigns;
CREATE POLICY "Owners can view their campaigns" ON public.campaigns FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()));

-- CLIENTS
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (barbershop_id = get_user_barbershop_id(auth.uid()));

DROP POLICY IF EXISTS "Owners can update clients" ON public.clients;
CREATE POLICY "Owners can update clients" ON public.clients FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = clients.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view their clients" ON public.clients;
CREATE POLICY "Owners can view their clients" ON public.clients FOR SELECT TO authenticated USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- LOYALTY_PROGRAMS
DROP POLICY IF EXISTS "Anyone can view loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Anyone can view loyalty programs" ON public.loyalty_programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Owners can delete loyalty programs" ON public.loyalty_programs FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = loyalty_programs.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Owners can insert loyalty programs" ON public.loyalty_programs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = loyalty_programs.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Owners can update loyalty programs" ON public.loyalty_programs FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = loyalty_programs.barbershop_id AND barbershops.owner_id = auth.uid()));

-- LOYALTY_REWARDS
DROP POLICY IF EXISTS "Owners can delete loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Owners can delete loyalty rewards" ON public.loyalty_rewards FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = loyalty_rewards.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Owners can update loyalty rewards" ON public.loyalty_rewards FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = loyalty_rewards.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Owners can view loyalty rewards" ON public.loyalty_rewards FOR SELECT TO authenticated USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Owners can view notifications" ON public.notifications;
CREATE POLICY "Owners can view notifications" ON public.notifications FOR SELECT USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = notifications.barbershop_id AND barbershops.owner_id = auth.uid()));

-- PLANS
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);

-- PROFESSIONAL_AVAILABILITY
DROP POLICY IF EXISTS "Anyone can view professional availability" ON public.professional_availability;
CREATE POLICY "Anyone can view professional availability" ON public.professional_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete professional availability" ON public.professional_availability;
CREATE POLICY "Owners can delete professional availability" ON public.professional_availability FOR DELETE USING (EXISTS (SELECT 1 FROM professionals p JOIN barbershops b ON b.id = p.barbershop_id WHERE p.id = professional_availability.professional_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert professional availability" ON public.professional_availability;
CREATE POLICY "Owners can insert professional availability" ON public.professional_availability FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM professionals p JOIN barbershops b ON b.id = p.barbershop_id WHERE p.id = professional_availability.professional_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update professional availability" ON public.professional_availability;
CREATE POLICY "Owners can update professional availability" ON public.professional_availability FOR UPDATE USING (EXISTS (SELECT 1 FROM professionals p JOIN barbershops b ON b.id = p.barbershop_id WHERE p.id = professional_availability.professional_id AND b.owner_id = auth.uid()));

-- PROFESSIONALS
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete professionals" ON public.professionals;
CREATE POLICY "Owners can delete professionals" ON public.professionals FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = professionals.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert professionals" ON public.professionals;
CREATE POLICY "Owners can insert professionals" ON public.professionals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = professionals.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update professionals" ON public.professionals;
CREATE POLICY "Owners can update professionals" ON public.professionals FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = professionals.barbershop_id AND barbershops.owner_id = auth.uid()));

-- PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- REFERRALS
DROP POLICY IF EXISTS "Owners can manage referrals" ON public.referrals;
CREATE POLICY "Owners can manage referrals" ON public.referrals FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = referrals.barbershop_id AND barbershops.owner_id = auth.uid()));

-- SERVICES
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete services" ON public.services;
CREATE POLICY "Owners can delete services" ON public.services FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = services.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can insert services" ON public.services;
CREATE POLICY "Owners can insert services" ON public.services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = services.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update services" ON public.services;
CREATE POLICY "Owners can update services" ON public.services FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = services.barbershop_id AND barbershops.owner_id = auth.uid()));

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Authenticated users can create subscription" ON public.subscriptions;
CREATE POLICY "Authenticated users can create subscription" ON public.subscriptions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = subscriptions.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update their subscription" ON public.subscriptions;
CREATE POLICY "Owners can update their subscription" ON public.subscriptions FOR UPDATE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = subscriptions.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view their subscription" ON public.subscriptions;
CREATE POLICY "Owners can view their subscription" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = subscriptions.barbershop_id AND barbershops.owner_id = auth.uid()));

-- TEAM_INVITES
DROP POLICY IF EXISTS "Owners can create invites" ON public.team_invites;
CREATE POLICY "Owners can create invites" ON public.team_invites FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = team_invites.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can delete invites" ON public.team_invites;
CREATE POLICY "Owners can delete invites" ON public.team_invites FOR DELETE USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = team_invites.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can view invites" ON public.team_invites;
CREATE POLICY "Owners can view invites" ON public.team_invites FOR SELECT USING (EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = team_invites.barbershop_id AND barbershops.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own invite status only" ON public.team_invites;
CREATE POLICY "Users can update own invite status only" ON public.team_invites FOR UPDATE TO authenticated USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text) WITH CHECK ((email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text) AND (role = (SELECT ti.role FROM team_invites ti WHERE ti.id = team_invites.id)) AND (barbershop_id = (SELECT ti.barbershop_id FROM team_invites ti WHERE ti.id = team_invites.id)) AND (invited_by = (SELECT ti.invited_by FROM team_invites ti WHERE ti.id = team_invites.id)));

DROP POLICY IF EXISTS "Users can view their own invites" ON public.team_invites;
CREATE POLICY "Users can view their own invites" ON public.team_invites FOR SELECT USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);

-- USER_ROLES
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
