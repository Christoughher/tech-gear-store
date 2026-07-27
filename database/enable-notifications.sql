-- =========================================================
-- BẬT TRUNG TÂM THÔNG BÁO CHO DATABASE ĐANG SỬ DỤNG
-- Migration idempotent: có thể chạy lại, không reset và không backfill dữ liệu cũ.
-- =========================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'order_created',
      'order_approved',
      'order_completed',
      'order_cancelled',
      'payment_succeeded',
      'admin_new_order',
      'admin_order_cancelled'
    )
  ),
  CONSTRAINT notifications_title_check CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT notifications_message_check CHECK (char_length(btrim(message)) > 0),
  CONSTRAINT notifications_metadata_object_check CHECK (
    jsonb_typeof(metadata) = 'object'
  ),
  CONSTRAINT notifications_user_dedupe_unique UNIQUE (user_id, dedupe_key)
);

COMMENT ON TABLE public.notifications IS
'Thông báo bất biến do backend tạo; người dùng chỉ được đọc và đánh dấu đã đọc qua RPC.';

COMMENT ON COLUMN public.notifications.type IS
'Loại sự kiện; payment_succeeded được dành sẵn cho webhook thanh toán đáng tin cậy trong tương lai.';

COMMENT ON COLUMN public.notifications.dedupe_key IS
'Khóa nghiệp vụ ổn định dùng cùng user_id để chống tạo thông báo trùng khi retry.';

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
ON public.notifications(user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created_at
ON public.notifications(user_id, created_at DESC, id DESC)
WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications"
ON public.notifications;

CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Client không được tự tạo, sửa hoặc xóa thông báo. Trigger và RPC SECURITY
-- DEFINER bên dưới là hai đường ghi duy nhất dành cho người dùng ứng dụng.
REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.notifications TO authenticated;

-- =========================================================
-- TẠO THÔNG BÁO TỪ VÒNG ĐỜI ĐƠN HÀNG
-- Trigger AFTER bảo đảm state machine của orders đã chấp nhận thay đổi.
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_order_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  short_order_code TEXT := upper(left(NEW.id::text, 8));
  user_notification_type VARCHAR;
  user_notification_title VARCHAR(160);
  user_notification_message TEXT;
  user_dedupe_key TEXT;
BEGIN
  -- Chỉ phát thông báo cho checkout thật đã được đánh dấu trừ kho. Order demo được
  -- seed trực tiếp có marker NULL nên không làm đầy chuông của admin/người dùng mock.
  IF NEW.inventory_deducted_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    VALUES (
      NEW.user_id,
      'order_created',
      'Đặt hàng thành công',
      format(
        'Đơn hàng #%s đã được tiếp nhận và đang chờ xác nhận.',
        short_order_code
      ),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('order:%s:created', NEW.id)
    )
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;

    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    SELECT
      admin_user.id,
      'admin_new_order',
      'Có đơn hàng mới',
      format('Đơn hàng #%s đang chờ quản trị viên duyệt.', short_order_code),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('admin:order:%s:created', NEW.id)
    FROM public.users AS admin_user
    WHERE admin_user.role = 'admin'
      AND admin_user.id <> NEW.user_id
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;

    RETURN NEW;
  END IF;

  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'processing' THEN
      user_notification_type := 'order_approved';
      user_notification_title := 'Đơn hàng đã được duyệt';
      user_notification_message := format(
        'Đơn hàng #%s đã được duyệt và đang được xử lý.',
        short_order_code
      );
    WHEN 'completed' THEN
      user_notification_type := 'order_completed';
      user_notification_title := 'Đơn hàng đã hoàn thành';
      user_notification_message := format(
        'Đơn hàng #%s đã hoàn thành. Cảm ơn bạn đã mua sắm tại TECH.NO.',
        short_order_code
      );
    WHEN 'cancelled' THEN
      user_notification_type := 'order_cancelled';
      user_notification_title := 'Đơn hàng đã được hủy';
      user_notification_message := format(
        'Đơn hàng #%s đã được hủy và tồn kho đã được hoàn lại.',
        short_order_code
      );
    ELSE
      RETURN NEW;
  END CASE;

  user_dedupe_key := format('order:%s:status:%s', NEW.id, NEW.status);

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    order_id,
    metadata,
    dedupe_key
  )
  VALUES (
    NEW.user_id,
    user_notification_type,
    user_notification_title,
    user_notification_message,
    NEW.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'previous_status', OLD.status,
      'status', NEW.status,
      'total_price', NEW.total_price
    ),
    user_dedupe_key
  )
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;

  IF NEW.status = 'cancelled' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    SELECT
      admin_user.id,
      'admin_order_cancelled',
      'Đơn hàng đã bị hủy',
      format('Đơn hàng #%s đã chuyển sang trạng thái đã hủy.', short_order_code),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'previous_status', OLD.status,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('admin:order:%s:status:cancelled', NEW.id)
    FROM public.users AS admin_user
    WHERE admin_user.role = 'admin'
      AND admin_user.id <> NEW.user_id
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_notifications()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS create_order_notifications
ON public.orders;

CREATE TRIGGER create_order_notifications
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_order_notifications();

-- =========================================================
-- RPC ĐỌC VÀ ĐÁNH DẤU ĐÃ ĐỌC
-- Mọi RPC SECURITY DEFINER đều tự ràng buộc auth.uid().
-- =========================================================

CREATE OR REPLACE FUNCTION public.list_my_notifications(
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  type VARCHAR,
  title VARCHAR,
  message TEXT,
  order_id UUID,
  metadata JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  normalized_limit INTEGER := LEAST(
    GREATEST(COALESCE(p_limit, 20), 1),
    50
  );
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    notification.id,
    notification.type,
    notification.title,
    notification.message,
    notification.order_id,
    notification.metadata,
    notification.read_at,
    notification.created_at
  FROM public.notifications AS notification
  WHERE notification.user_id = current_user_id
  ORDER BY notification.created_at DESC, notification.id DESC
  LIMIT normalized_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_unread_notification_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  unread_count BIGINT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  SELECT COUNT(*)
  INTO unread_count
  FROM public.notifications AS notification
  WHERE notification.user_id = current_user_id
    AND notification.read_at IS NULL;

  RETURN unread_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_my_notification_read(
  p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  notification_found BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  IF p_notification_id IS NULL THEN
    RAISE EXCEPTION 'Notification id is required';
  END IF;

  UPDATE public.notifications AS notification
  SET read_at = COALESCE(notification.read_at, statement_timestamp())
  WHERE notification.id = p_notification_id
    AND notification.user_id = current_user_id;

  notification_found := FOUND;
  RETURN notification_found;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_my_notifications_read()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  updated_count BIGINT := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  UPDATE public.notifications AS notification
  SET read_at = statement_timestamp()
  WHERE notification.user_id = current_user_id
    AND notification.read_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.list_my_notifications(INTEGER)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_my_unread_notification_count()
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_my_notification_read(UUID)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_all_my_notifications_read()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.list_my_notifications(INTEGER)
TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_unread_notification_count()
TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_my_notification_read(UUID)
TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_my_notifications_read()
TO authenticated;

-- Phát INSERT/UPDATE qua Supabase Realtime. DO block tránh lỗi khi migration
-- được chạy lại hoặc khi publication chưa tồn tại trong môi trường không phải Supabase.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
