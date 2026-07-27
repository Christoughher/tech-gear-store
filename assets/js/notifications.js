(() => {
    'use strict';

    const NOTIFICATION_LIMIT = 20;
    const PROFILE_ORDERS_URL = '/pages/profile.html#orders';
    const ADMIN_ORDERS_URL = '/pages/admin/admin-qly-donhang.html';
    const ADMIN_NOTIFICATION_TYPES = new Set([
        'admin_new_order',
        'admin_order_cancelled'
    ]);

    const notificationTypeConfig = Object.freeze({
        order_created: Object.freeze({
            label: 'Đặt hàng thành công',
            fallbackMessage: 'Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận.',
            icon: 'fa-bag-shopping',
            tone: 'info'
        }),
        order_approved: Object.freeze({
            label: 'Đơn hàng đã được duyệt',
            fallbackMessage: 'Cửa hàng đã duyệt đơn hàng và đang chuẩn bị giao cho bạn.',
            icon: 'fa-circle-check',
            tone: 'success'
        }),
        order_completed: Object.freeze({
            label: 'Đơn hàng đã hoàn thành',
            fallbackMessage: 'Đơn hàng của bạn đã được giao và hoàn thành.',
            icon: 'fa-box-open',
            tone: 'success'
        }),
        order_cancelled: Object.freeze({
            label: 'Đơn hàng đã hủy',
            fallbackMessage: 'Đơn hàng đã được hủy và tồn kho đã được cập nhật.',
            icon: 'fa-circle-xmark',
            tone: 'danger'
        }),
        payment_succeeded: Object.freeze({
            label: 'Thanh toán thành công',
            fallbackMessage: 'Khoản thanh toán của đơn hàng đã được xác nhận.',
            icon: 'fa-credit-card',
            tone: 'success'
        }),
        admin_new_order: Object.freeze({
            label: 'Có đơn hàng mới',
            fallbackMessage: 'Một đơn hàng mới đang chờ quản trị viên duyệt.',
            icon: 'fa-receipt',
            tone: 'info'
        }),
        admin_order_cancelled: Object.freeze({
            label: 'Khách hàng đã hủy đơn',
            fallbackMessage: 'Một đơn hàng đã được khách hàng hủy.',
            icon: 'fa-triangle-exclamation',
            tone: 'warning'
        })
    });

    const fallbackTypeConfig = Object.freeze({
        label: 'Thông báo mới',
        fallbackMessage: 'Bạn có một cập nhật mới từ TECH.NO.',
        icon: 'fa-bell',
        tone: 'info'
    });

    const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
    const relativeTimeFormatter = new Intl.RelativeTimeFormat('vi-VN', {
        numeric: 'auto'
    });

    const state = {
        client: null,
        user: null,
        userId: null,
        elements: null,
        notifications: [],
        unreadCount: 0,
        hasLoaded: false,
        isLoading: false,
        loadError: null,
        refreshSequence: 0,
        scheduledRefreshId: null,
        realtimeChannel: null,
        authSubscription: null,
        authSubscriptionClient: null,
        uiAbortController: null,
        initializationPromise: null
    };

    function createElement(tagName, className = '', text = '') {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== '') {
            element.textContent = String(text);
        }

        return element;
    }

    function getTypeConfig(type) {
        return notificationTypeConfig[type] || fallbackTypeConfig;
    }

    function captureElements() {
        const nav = document.getElementById('notification-nav');

        if (!nav) return null;

        const elements = {
            nav,
            trigger: nav.querySelector('[data-notification-trigger]'),
            dot: nav.querySelector('[data-notification-dot]'),
            status: nav.querySelector('[data-notification-status]'),
            panel: nav.querySelector('[data-notification-panel]'),
            list: nav.querySelector('[data-notification-list]'),
            markAll: nav.querySelector('[data-notification-mark-all]')
        };

        return Object.values(elements).every(Boolean) ? elements : null;
    }

    function normalizeUnreadCount(value) {
        let candidate = value;

        if (Array.isArray(candidate)) {
            candidate = candidate[0];
        }

        if (candidate && typeof candidate === 'object') {
            candidate = candidate.unread_count ?? candidate.count ?? candidate.value;
        }

        const numericValue = Number(candidate);

        if (!Number.isFinite(numericValue)) {
            return 0;
        }

        return Math.max(0, Math.floor(numericValue));
    }

    function normalizeNotifications(value) {
        const rows = Array.isArray(value)
            ? value
            : (Array.isArray(value?.notifications) ? value.notifications : []);

        return rows
            .filter(row => row && row.id)
            .map(row => ({
                id: String(row.id),
                type: String(row.type || ''),
                title: String(row.title || '').trim(),
                message: String(row.message || '').trim(),
                order_id: row.order_id ? String(row.order_id) : null,
                metadata: (
                    row.metadata
                    && typeof row.metadata === 'object'
                    && !Array.isArray(row.metadata)
                ) ? row.metadata : {},
                read_at: row.read_at || null,
                created_at: row.created_at || null
            }));
    }

    function formatNotificationTime(value) {
        if (!value) return '';

        const date = new Date(value);
        const timestamp = date.getTime();

        if (!Number.isFinite(timestamp)) return '';

        const elapsedSeconds = Math.round((timestamp - Date.now()) / 1000);
        const absoluteSeconds = Math.abs(elapsedSeconds);

        if (absoluteSeconds < 60) {
            return 'Vừa xong';
        }

        if (absoluteSeconds < 3600) {
            return relativeTimeFormatter.format(Math.round(elapsedSeconds / 60), 'minute');
        }

        if (absoluteSeconds < 86400) {
            return relativeTimeFormatter.format(Math.round(elapsedSeconds / 3600), 'hour');
        }

        if (absoluteSeconds < 604800) {
            return relativeTimeFormatter.format(Math.round(elapsedSeconds / 86400), 'day');
        }

        return dateTimeFormatter.format(date);
    }

    function getNotificationDestination(notification) {
        if (!notification.order_id) return null;

        return ADMIN_NOTIFICATION_TYPES.has(notification.type)
            ? ADMIN_ORDERS_URL
            : PROFILE_ORDERS_URL;
    }

    function setPanelOpen(shouldOpen, { restoreFocus = false } = {}) {
        const elements = state.elements;
        if (!elements) return;

        const isOpen = Boolean(shouldOpen && state.userId);
        elements.panel.hidden = !isOpen;
        elements.panel.setAttribute('aria-hidden', String(!isOpen));
        elements.trigger.setAttribute('aria-expanded', String(isOpen));
        elements.nav.classList.toggle('is-open', isOpen);

        if (!isOpen && restoreFocus) {
            elements.trigger.focus();
        }
    }

    function updateUnreadIndicator() {
        const elements = state.elements;
        if (!elements) return;

        const unreadCount = normalizeUnreadCount(state.unreadCount);
        const hasUnread = unreadCount > 0;

        elements.dot.hidden = !hasUnread;
        elements.dot.textContent = '';
        elements.status.textContent = hasUnread
            ? `${unreadCount} thông báo chưa đọc`
            : 'Không có thông báo mới';
        elements.trigger.classList.toggle('has-unread', hasUnread);
        elements.trigger.setAttribute(
            'aria-label',
            hasUnread
                ? `Thông báo, ${unreadCount} thông báo chưa đọc`
                : 'Thông báo'
        );
        elements.markAll.hidden = !hasUnread;
        elements.markAll.disabled = !hasUnread || state.isLoading;
    }

    function renderState(iconClass, title, message, className) {
        const elements = state.elements;
        if (!elements) return;

        const wrapper = createElement('div', className);
        wrapper.setAttribute('role', className.includes('error') ? 'alert' : 'status');

        const icon = createElement('i', `fa-solid ${iconClass}`);
        icon.setAttribute('aria-hidden', 'true');

        const content = createElement('div', `${className}__content`);
        content.append(
            createElement('strong', `${className}__title`, title),
            createElement('span', `${className}__message`, message)
        );
        wrapper.append(icon, content);
        elements.list.replaceChildren(wrapper);
    }

    function renderNotifications() {
        const elements = state.elements;
        if (!elements) return;

        updateUnreadIndicator();

        if (state.isLoading && !state.hasLoaded) {
            renderState(
                'fa-spinner fa-spin',
                'Đang tải thông báo',
                'Vui lòng chờ trong giây lát.',
                'notification-loading-state'
            );
            return;
        }

        if (state.loadError && !state.notifications.length) {
            renderState(
                'fa-circle-exclamation',
                'Chưa thể tải thông báo',
                'Vui lòng kiểm tra kết nối và thử lại.',
                'notification-error-state'
            );
            return;
        }

        if (!state.notifications.length) {
            renderState(
                'fa-bell-slash',
                'Chưa có thông báo',
                'Các cập nhật về đơn hàng sẽ xuất hiện tại đây.',
                'notification-empty-state'
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        state.notifications.forEach(notification => {
            const config = getTypeConfig(notification.type);
            const destination = getNotificationDestination(notification);
            const item = createElement(
                destination ? 'a' : 'button',
                `notification-item notification-item--${config.tone}`
            );
            const isUnread = !notification.read_at;

            item.dataset.notificationId = notification.id;
            item.dataset.notificationType = notification.type;
            item.classList.toggle('is-unread', isUnread);

            if (destination) {
                item.href = destination;
            } else {
                item.type = 'button';
            }

            const iconWrapper = createElement('span', 'notification-item__icon');
            const icon = createElement('i', `fa-solid ${config.icon}`);
            icon.setAttribute('aria-hidden', 'true');
            iconWrapper.appendChild(icon);

            const content = createElement('span', 'notification-item__content');
            const titleRow = createElement('span', 'notification-item__title-row');
            const title = createElement(
                'strong',
                'notification-item__title',
                notification.title || config.label
            );
            titleRow.appendChild(title);

            if (isUnread) {
                const unreadMarker = createElement('span', 'notification-item__unread');
                unreadMarker.setAttribute('aria-label', 'Chưa đọc');
                titleRow.appendChild(unreadMarker);
            }

            const message = createElement(
                'span',
                'notification-item__message',
                notification.message || config.fallbackMessage
            );
            const time = createElement(
                'time',
                'notification-item__time',
                formatNotificationTime(notification.created_at)
            );

            if (notification.created_at) {
                time.dateTime = String(notification.created_at);
            }

            content.append(titleRow, message, time);
            item.append(iconWrapper, content);
            item.addEventListener('click', event => {
                handleNotificationActivation(event, notification, destination);
            });
            fragment.appendChild(item);
        });

        elements.list.replaceChildren(fragment);
    }

    async function refreshNotifications({ showLoading = false } = {}) {
        if (!state.client || !state.userId) return [];

        const userId = state.userId;
        const refreshSequence = ++state.refreshSequence;

        if (showLoading && !state.hasLoaded) {
            state.isLoading = true;
            state.loadError = null;
            state.elements?.list.setAttribute('aria-busy', 'true');
            renderNotifications();
        }

        try {
            const [listResult, countResult] = await Promise.all([
                state.client.rpc('list_my_notifications', {
                    p_limit: NOTIFICATION_LIMIT
                }),
                state.client.rpc('get_my_unread_notification_count')
            ]);

            if (listResult.error) throw listResult.error;
            if (countResult.error) throw countResult.error;

            if (
                state.userId !== userId
                || refreshSequence !== state.refreshSequence
            ) {
                return state.notifications;
            }

            state.notifications = normalizeNotifications(listResult.data);
            state.unreadCount = normalizeUnreadCount(countResult.data);
            state.hasLoaded = true;
            state.loadError = null;
            return state.notifications;
        } catch (error) {
            if (
                state.userId === userId
                && refreshSequence === state.refreshSequence
            ) {
                state.loadError = error;
                console.error('Không thể tải trung tâm thông báo:', error);
            }

            return state.notifications;
        } finally {
            if (refreshSequence === state.refreshSequence) {
                state.isLoading = false;
                state.elements?.list.setAttribute('aria-busy', 'false');
                renderNotifications();
            }
        }
    }

    function scheduleRefresh(delay = 120) {
        if (!state.userId) return;

        if (state.scheduledRefreshId !== null) {
            window.clearTimeout(state.scheduledRefreshId);
        }

        state.scheduledRefreshId = window.setTimeout(() => {
            state.scheduledRefreshId = null;
            refreshNotifications();
        }, delay);
    }

    async function markNotificationRead(notificationId) {
        const notification = state.notifications.find(item => item.id === notificationId);
        if (!notification || notification.read_at || !state.userId) return true;

        const userId = state.userId;
        const { data, error } = await state.client.rpc('mark_my_notification_read', {
            p_notification_id: notificationId
        });

        if (error) throw error;
        if (state.userId !== userId || data !== true) return false;

        const readAt = new Date().toISOString();
        state.notifications = state.notifications.map(item => (
            item.id === notificationId
                ? { ...item, read_at: readAt }
                : item
        ));
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        renderNotifications();
        return true;
    }

    async function handleNotificationActivation(event, notification, destination) {
        const shouldControlNavigation = Boolean(
            destination
            && event.button === 0
            && !event.metaKey
            && !event.ctrlKey
            && !event.shiftKey
            && !event.altKey
        );

        if (shouldControlNavigation && !notification.read_at) {
            event.preventDefault();
        }

        try {
            await markNotificationRead(notification.id);
        } catch (error) {
            console.error('Không thể đánh dấu thông báo đã đọc:', error);
        } finally {
            if (shouldControlNavigation && !notification.read_at) {
                window.location.assign(destination);
            }
        }
    }

    async function handleMarkAllRead() {
        if (!state.client || !state.userId || state.unreadCount < 1) return;

        const userId = state.userId;
        state.elements.markAll.disabled = true;

        try {
            const { error } = await state.client.rpc('mark_all_my_notifications_read');
            if (error) throw error;
            if (state.userId !== userId) return;

            const readAt = new Date().toISOString();
            state.notifications = state.notifications.map(notification => ({
                ...notification,
                read_at: notification.read_at || readAt
            }));
            state.unreadCount = 0;
            renderNotifications();
        } catch (error) {
            console.error('Không thể đánh dấu tất cả thông báo đã đọc:', error);
            updateUnreadIndicator();
        }
    }

    function clearScheduledRefresh() {
        if (state.scheduledRefreshId !== null) {
            window.clearTimeout(state.scheduledRefreshId);
            state.scheduledRefreshId = null;
        }
    }

    function removeRealtimeChannel() {
        const channel = state.realtimeChannel;
        state.realtimeChannel = null;

        if (!channel) return;

        if (typeof state.client?.removeChannel === 'function') {
            Promise.resolve(state.client.removeChannel(channel)).catch(error => {
                console.warn('Không thể gỡ kênh Realtime thông báo:', error);
            });
        } else if (typeof channel.unsubscribe === 'function') {
            Promise.resolve(channel.unsubscribe()).catch(error => {
                console.warn('Không thể hủy đăng ký Realtime thông báo:', error);
            });
        }
    }

    function subscribeToRealtime(user) {
        removeRealtimeChannel();

        if (!state.client || !user?.id || typeof state.client.channel !== 'function') {
            return;
        }

        state.realtimeChannel = state.client
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => scheduleRefresh()
            )
            .subscribe(status => {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('Kênh Realtime thông báo tạm thời chưa khả dụng.');
                }
            });
    }

    function resetForSignedOutUser() {
        state.refreshSequence += 1;
        state.user = null;
        state.userId = null;
        state.notifications = [];
        state.unreadCount = 0;
        state.hasLoaded = false;
        state.isLoading = false;
        state.loadError = null;
        clearScheduledRefresh();
        removeRealtimeChannel();

        if (state.elements) {
            setPanelOpen(false);
            state.elements.nav.hidden = true;
            state.elements.list.replaceChildren();
            updateUnreadIndicator();
        }
    }

    async function applySession(session) {
        const nextUser = session?.user || null;
        const nextUserId = nextUser?.id ? String(nextUser.id) : null;

        if (!nextUserId) {
            resetForSignedOutUser();
            return;
        }

        const hasChangedUser = state.userId !== nextUserId;
        state.user = nextUser;
        state.userId = nextUserId;

        if (state.elements) {
            state.elements.nav.hidden = false;
        }

        if (hasChangedUser) {
            state.refreshSequence += 1;
            state.notifications = [];
            state.unreadCount = 0;
            state.hasLoaded = false;
            state.loadError = null;
            subscribeToRealtime(nextUser);
        } else if (!state.realtimeChannel) {
            subscribeToRealtime(nextUser);
        }

        updateUnreadIndicator();
        await refreshNotifications({ showLoading: !state.hasLoaded });
    }

    function ensureAuthSubscription() {
        if (!state.client?.auth) return;
        if (
            state.authSubscription
            && state.authSubscriptionClient === state.client
        ) {
            return;
        }

        state.authSubscription?.unsubscribe?.();
        const { data } = state.client.auth.onAuthStateChange((_event, session) => {
            window.setTimeout(() => {
                applySession(session).catch(error => {
                    console.error('Không thể đồng bộ phiên cho trung tâm thông báo:', error);
                });
            }, 0);
        });

        state.authSubscription = data?.subscription || null;
        state.authSubscriptionClient = state.client;
    }

    function bindUiEvents(elements) {
        state.uiAbortController?.abort();
        state.uiAbortController = (
            typeof AbortController === 'function'
                ? new AbortController()
                : null
        );
        const listenerOptions = state.uiAbortController
            ? { signal: state.uiAbortController.signal }
            : undefined;

        if (!elements.panel.id) {
            elements.panel.id = 'notification-panel';
        }

        elements.trigger.setAttribute('aria-controls', elements.panel.id);
        elements.trigger.setAttribute('aria-haspopup', 'true');
        elements.trigger.setAttribute('aria-expanded', 'false');
        elements.panel.setAttribute('aria-hidden', 'true');
        elements.list.setAttribute('aria-live', 'polite');
        elements.panel.hidden = true;

        elements.trigger.addEventListener('click', () => {
            const shouldOpen = elements.panel.hidden;
            setPanelOpen(shouldOpen);

            if (shouldOpen) {
                refreshNotifications({ showLoading: !state.hasLoaded });
            }
        }, listenerOptions);

        elements.markAll.addEventListener('click', () => {
            handleMarkAllRead();
        }, listenerOptions);

        document.addEventListener('pointerdown', event => {
            if (
                !elements.panel.hidden
                && !elements.nav.contains(event.target)
            ) {
                setPanelOpen(false);
            }
        }, listenerOptions);

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !elements.panel.hidden) {
                event.preventDefault();
                setPanelOpen(false, { restoreFocus: true });
            }
        }, listenerOptions);

        window.addEventListener('focus', () => {
            scheduleRefresh(0);
        }, listenerOptions);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                scheduleRefresh(0);
            }
        }, listenerOptions);
    }

    async function init() {
        if (state.initializationPromise) {
            return state.initializationPromise;
        }

        state.initializationPromise = (async () => {
            const elements = captureElements();

            if (!elements) {
                return false;
            }

            if (!window.supabaseClient?.auth) {
                elements.nav.hidden = true;
                console.error('Không tìm thấy Supabase để tải trung tâm thông báo.');
                return false;
            }

            const hasNewNavbar = state.elements?.nav !== elements.nav;
            state.elements = elements;
            state.client = window.supabaseClient;

            if (hasNewNavbar) {
                bindUiEvents(elements);
            }

            elements.nav.hidden = true;
            updateUnreadIndicator();
            ensureAuthSubscription();

            const { data: sessionData, error: sessionError } = await state.client.auth.getSession();
            if (sessionError) throw sessionError;

            let session = sessionData?.session || null;

            if (session?.user) {
                const { data: userData, error: userError } = await state.client.auth.getUser();
                if (userError) throw userError;
                session = userData?.user
                    ? { ...session, user: userData.user }
                    : null;
            }

            await applySession(session);
            return true;
        })().catch(error => {
            resetForSignedOutUser();
            console.error('Không thể khởi tạo trung tâm thông báo:', error);
            return false;
        }).finally(() => {
            state.initializationPromise = null;
        });

        return state.initializationPromise;
    }

    function destroy() {
        resetForSignedOutUser();
        state.uiAbortController?.abort();
        state.uiAbortController = null;
        state.authSubscription?.unsubscribe?.();
        state.authSubscription = null;
        state.authSubscriptionClient = null;
        state.elements = null;
        state.client = null;
    }

    window.TechnoNotifications = Object.freeze({
        init,
        refresh: refreshNotifications,
        close: () => setPanelOpen(false),
        destroy,
        types: notificationTypeConfig
    });

    window.addEventListener('navbarLoaded', () => {
        init();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('notification-nav')) {
                init();
            }
        }, { once: true });
    } else if (document.getElementById('notification-nav')) {
        init();
    }
})();
