-- Create mosquito net products table (price list)
CREATE TABLE public.mosquito_net_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  price_per_m2 NUMERIC(10,2) NOT NULL DEFAULT 0,
  color TEXT, -- bijeli/smeđi
  product_type TEXT, -- prozor/vrata/rolo
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mosquito net locations table (measurement/installation prices)
CREATE TABLE public.mosquito_net_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_name TEXT NOT NULL,
  measurement_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  window_installation_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  door_installation_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mosquito net quote items table
CREATE TABLE public.mosquito_net_quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'komarnici', 'mjerenje', 'ugradnja'
  sort_order INTEGER DEFAULT 0,
  -- For komarnici section
  product_id UUID REFERENCES public.mosquito_net_products(id),
  product_name TEXT,
  width_cm NUMERIC(10,2),
  height_cm NUMERIC(10,2),
  calculated_m2 NUMERIC(10,4),
  unit_price NUMERIC(10,2),
  quantity INTEGER DEFAULT 1,
  -- For mjerenje/ugradnja sections
  location_id UUID REFERENCES public.mosquito_net_locations(id),
  location_name TEXT,
  measurement_price NUMERIC(10,2),
  window_count INTEGER DEFAULT 0,
  door_count INTEGER DEFAULT 0,
  window_price NUMERIC(10,2),
  door_price NUMERIC(10,2),
  -- Common
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mosquito_net_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosquito_net_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosquito_net_quote_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for products
CREATE POLICY "Users can view their own mosquito net products"
ON public.mosquito_net_products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mosquito net products"
ON public.mosquito_net_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mosquito net products"
ON public.mosquito_net_products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mosquito net products"
ON public.mosquito_net_products FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for locations
CREATE POLICY "Users can view their own mosquito net locations"
ON public.mosquito_net_locations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mosquito net locations"
ON public.mosquito_net_locations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mosquito net locations"
ON public.mosquito_net_locations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mosquito net locations"
ON public.mosquito_net_locations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for quote items (based on document ownership)
CREATE POLICY "Users can view mosquito net quote items for their documents"
ON public.mosquito_net_quote_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.documents d 
  WHERE d.id = document_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create mosquito net quote items for their documents"
ON public.mosquito_net_quote_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents d 
  WHERE d.id = document_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can update mosquito net quote items for their documents"
ON public.mosquito_net_quote_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.documents d 
  WHERE d.id = document_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can delete mosquito net quote items for their documents"
ON public.mosquito_net_quote_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.documents d 
  WHERE d.id = document_id AND d.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_mosquito_net_products_updated_at
BEFORE UPDATE ON public.mosquito_net_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mosquito_net_locations_updated_at
BEFORE UPDATE ON public.mosquito_net_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();