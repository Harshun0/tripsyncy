-- Lost & Found feature
CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('lost', 'found')),
  title text NOT NULL,
  description text,
  location text,
  contact_phone text,
  finder_name text,
  media_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lost_found_type_status_created
  ON public.lost_found_items (type, status, created_at DESC);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lost found readable by authenticated" ON public.lost_found_items;
CREATE POLICY "Lost found readable by authenticated"
ON public.lost_found_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lost found insert by owner" ON public.lost_found_items;
CREATE POLICY "Lost found insert by owner"
ON public.lost_found_items FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Lost found update by owner" ON public.lost_found_items;
CREATE POLICY "Lost found update by owner"
ON public.lost_found_items FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Lost found delete by owner" ON public.lost_found_items;
CREATE POLICY "Lost found delete by owner"
ON public.lost_found_items FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER trg_lost_found_updated
BEFORE UPDATE ON public.lost_found_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found-media', 'lost-found-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lost found media public read" ON storage.objects;
CREATE POLICY "Lost found media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'lost-found-media');

DROP POLICY IF EXISTS "Lost found media owner upload" ON storage.objects;
CREATE POLICY "Lost found media owner upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lost-found-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Lost found media owner update" ON storage.objects;
CREATE POLICY "Lost found media owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'lost-found-media' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'lost-found-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Lost found media owner delete" ON storage.objects;
CREATE POLICY "Lost found media owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'lost-found-media' AND auth.uid()::text = (storage.foldername(name))[1]);