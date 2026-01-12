-- Create reminders table for document deadline tracking
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'deadline',
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own reminders"
ON public.reminders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders"
ON public.reminders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
ON public.reminders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
ON public.reminders
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_reminders_user_due_date ON public.reminders(user_id, due_date);
CREATE INDEX idx_reminders_document_id ON public.reminders(document_id);

-- Add trigger for updated_at
CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();