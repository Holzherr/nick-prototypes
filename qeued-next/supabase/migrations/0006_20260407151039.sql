
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_username text;
  final_username text;
  attempt int := 0;
BEGIN
  -- Extract part before @ from email, keep only alphanumeric and dashes
  base_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  
  -- Truncate to 20 chars max
  base_username := left(base_username, 20);
  
  -- Try with random suffix until unique
  LOOP
    IF attempt = 0 THEN
      final_username := base_username;
    ELSE
      final_username := base_username || floor(random() * 900 + 100)::int::text;
    END IF;
    
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username);
    attempt := attempt + 1;
    EXIT WHEN attempt > 10;
  END LOOP;

  INSERT INTO public.profiles (user_id, name, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), final_username);
  RETURN NEW;
END;
$function$;
