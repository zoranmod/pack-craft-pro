-- Add monter fields to documents table for nalog-dostava-montaza
ALTER TABLE public.documents 
ADD COLUMN monter1 text,
ADD COLUMN monter2 text;