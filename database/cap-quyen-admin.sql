BEGIN;

SELECT set_config('request.jwt.claim.role', 'service_role', true);

INSERT INTO public.users (id, email, display_name, role)
SELECT
  id,
  email,
  'admintechno',
  'admin'
FROM auth.users
WHERE lower(email) = lower('123admin@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(public.users.display_name, EXCLUDED.display_name),
  role = 'admin',
  updated_at = now();

COMMIT;