-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rok', 'isporuka', 'montaza', 'ostalo')),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  client_id UUID,
  employee_id UUID,
  location TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- Create public_holidays table
CREATE TABLE public.public_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'HR',
  date DATE NOT NULL,
  name TEXT NOT NULL,
  is_non_working BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, country_code, date)
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

-- Calendar events policies (users can CRUD their own)
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Admin employees policies for calendar events
CREATE POLICY "Admin employees can view owner calendar events"
ON public.calendar_events FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner calendar events"
ON public.calendar_events FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner calendar events"
ON public.calendar_events FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Public holidays policies
CREATE POLICY "Users can view their own holidays"
ON public.public_holidays FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own holidays"
ON public.public_holidays FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holidays"
ON public.public_holidays FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holidays"
ON public.public_holidays FOR DELETE
USING (auth.uid() = user_id);

-- Admin employees policies for public holidays
CREATE POLICY "Admin employees can view owner holidays"
ON public.public_holidays FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner holidays"
ON public.public_holidays FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner holidays"
ON public.public_holidays FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner holidays"
ON public.public_holidays FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_at ON public.calendar_events(start_at);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(type);
CREATE INDEX idx_calendar_events_related ON public.calendar_events(related_entity_type, related_entity_id);
CREATE INDEX idx_public_holidays_user_date ON public.public_holidays(user_id, date);

-- Updated at trigger for calendar_events
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Updated at trigger for public_holidays
CREATE TRIGGER update_public_holidays_updated_at
BEFORE UPDATE ON public.public_holidays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();