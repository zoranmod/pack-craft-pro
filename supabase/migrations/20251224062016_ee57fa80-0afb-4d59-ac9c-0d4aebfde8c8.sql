-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('otpremnica', 'ponuda', 'nalog-dostava', 'nalog-montaza')),
  number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'cancelled')),
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  client_oib TEXT,
  notes TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document items table
CREATE TABLE public.document_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kom',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(5,2) NOT NULL DEFAULT 0,
  pdv NUMERIC(5,2) NOT NULL DEFAULT 25,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for document items (through document ownership)
CREATE POLICY "Users can view items of their documents" 
ON public.document_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_items.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create items for their documents" 
ON public.document_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_items.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update items of their documents" 
ON public.document_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_items.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete items of their documents" 
ON public.document_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_items.document_id 
  AND documents.user_id = auth.uid()
));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();