-- =========================================================
-- TECH.NO - SYNC SUPABASE AUTH USERS TO PUBLIC.USERS
--
-- Mục đích:
--   1. Đồng bộ toàn bộ tài khoản hiện có từ auth.users sang public.users.
--   2. Tạo lại đúng một trigger để tài khoản mới tự động được đồng bộ.
--   3. Giữ nguyên role của hồ sơ đã tồn tại (không hạ admin thành customer).
--
-- Chạy sau create-table.sql. Có thể chạy lại an toàn.
-- Không sao chép mật khẩu, token hoặc encrypted_password.
-- =========================================================

BEGIN;

-- Dừng toàn bộ transaction nếu cùng một email đang thuộc hai UUID khác nhau.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.users AS public_user
    JOIN auth.users AS auth_user
      ON lower(public_user.email) = lower(auth_user.email)
    WHERE public_user.id <> auth_user.id
  ) THEN
    RAISE EXCEPTION
      'Email conflict: the same email belongs to different IDs in auth.users and public.users';
  END IF;
END;
$$;

-- Function dùng cho mọi tài khoản đăng ký sau thời điểm chạy script.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    phone,
    address,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@unknown.local'),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'customer'
    ),
    NULLIF(NEW.phone, ''),
    NULLIF(NEW.raw_user_meta_data->>'address', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(
      NULLIF(public.users.display_name, ''),
      EXCLUDED.display_name
    ),
    phone = COALESCE(
      NULLIF(public.users.phone, ''),
      EXCLUDED.phone
    ),
    address = COALESCE(
      NULLIF(public.users.address, ''),
      EXCLUDED.address
    ),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Chỉ thay trigger do dự án quản lý; không xóa các custom trigger khác.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Backfill toàn bộ tài khoản đã tồn tại trước khi trigger được cài.
INSERT INTO public.users (
  id,
  email,
  display_name,
  phone,
  address,
  role,
  created_at,
  updated_at
)
SELECT
  auth_user.id,
  COALESCE(auth_user.email, auth_user.id::text || '@unknown.local'),
  COALESCE(
    NULLIF(auth_user.raw_user_meta_data->>'display_name', ''),
    NULLIF(auth_user.raw_user_meta_data->>'full_name', ''),
    NULLIF(split_part(COALESCE(auth_user.email, ''), '@', 1), ''),
    'customer'
  ),
  NULLIF(auth_user.phone, ''),
  NULLIF(auth_user.raw_user_meta_data->>'address', ''),
  'customer',
  auth_user.created_at,
  now()
FROM auth.users AS auth_user
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(
    NULLIF(public.users.display_name, ''),
    EXCLUDED.display_name
  ),
  phone = COALESCE(
    NULLIF(public.users.phone, ''),
    EXCLUDED.phone
  ),
  address = COALESCE(
    NULLIF(public.users.address, ''),
    EXCLUDED.address
  ),
  updated_at = now();

COMMIT;

-- =========================================================
-- VERIFICATION
-- missing_profiles phải bằng 0.
-- =========================================================

SELECT
  (SELECT count(*) FROM auth.users) AS auth_users,
  (SELECT count(*) FROM public.users) AS public_users,
  (
    SELECT count(*)
    FROM auth.users AS auth_user
    LEFT JOIN public.users AS public_user
      ON public_user.id = auth_user.id
    WHERE public_user.id IS NULL
  ) AS missing_profiles;

SELECT
  auth_user.id,
  auth_user.email,
  public_user.display_name,
  public_user.role
FROM auth.users AS auth_user
LEFT JOIN public.users AS public_user
  ON public_user.id = auth_user.id
ORDER BY auth_user.created_at DESC;
