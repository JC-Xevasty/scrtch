/*
* ==========================================
* 00_AUTOMATED_UPDATED_AT_SETTER_UP_SCRIPT
* ==========================================
*/

/*
* AUTOMATED TIMESTAMPS EXTENSION
*/

-- Automatic updated_at value update
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;