CREATE TABLE public.temperature_readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  temperature numeric(4,2) NOT NULL,
  notes text,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own temperature readings"
ON public.temperature_readings
TO authenticated
USING ((auth.uid())::text = user_id)
WITH CHECK ((auth.uid())::text = user_id);

GRANT ALL ON TABLE public.temperature_readings TO anon;
GRANT ALL ON TABLE public.temperature_readings TO authenticated;
GRANT ALL ON TABLE public.temperature_readings TO service_role;
