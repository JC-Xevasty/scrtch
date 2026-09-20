/*
* ==========================================
* 00_AUTOMATED_UPDATED_AT_SETTER_DOWN_SCRIPT
* ==========================================
*/

-- Drop the shared timestamp utility function
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at();