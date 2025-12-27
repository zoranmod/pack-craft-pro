-- Fix notification trigger functions to use correct column name 'number' instead of 'document_number'

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_document_insert ON public.documents;
DROP TRIGGER IF EXISTS on_document_status_change ON public.documents;

-- Recreate the notification function for new documents with correct column name
CREATE OR REPLACE FUNCTION public.notify_on_new_document()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, document_id)
  VALUES (
    NEW.user_id,
    'Novi dokument kreiran',
    'Dokument ' || NEW.number || ' je uspješno kreiran',
    'new_document',
    NEW.id
  );
  RETURN NEW;
END;
$function$;

-- Recreate the notification function for status changes with correct column name
CREATE OR REPLACE FUNCTION public.notify_on_document_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, document_id)
    VALUES (
      NEW.user_id,
      'Status dokumenta promijenjen',
      'Dokument ' || NEW.number || ' je promijenio status u ' || NEW.status,
      'status_change',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate the triggers
CREATE TRIGGER on_document_insert
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_document();

CREATE TRIGGER on_document_status_change
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_document_status_change();