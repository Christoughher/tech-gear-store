(() => {
    const PAGE_SIZE = 8;
    const AUTO_REFRESH_INTERVAL = 30000;
    const statusMeta = {
        pending: {
            label: 'Chờ xác nhận',
            className: 'is-pending',
            description: 'Đơn hàng đã được tiếp nhận và đang chờ cửa hàng xác nhận.'
        },
        processing: {
            label: 'Đang xử lý',
            className: 'is-processing',
            description: 'Cửa hàng đang chuẩn bị và giao đơn hàng của bạn.'
        },
        completed: {
            label: 'Hoàn thành',
            className: 'is-completed',
            description: 'Đơn hàng đã được hoàn thành.'
        },
        cancelled: {
            label: 'Đã hủy',
            className: 'is-cancelled',
            description: 'Đơn hàng đã được hủy và không còn tiếp tục xử lý.'
        }
    };
    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });
    const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const numberFormatter = new Intl.NumberFormat('vi-VN');

    const state = {
        activeTab: 'account',
        page: 1,
        status: '',
        total: 0,
        requestId: 0,
        hasLoaded: false,
        lastLoadedAt: 0,
        user: null,
        client: null,
        alertTimer: null
    };

    let elements = null;

    function createElement(tagName, className = '', text = '') {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== '') element.textContent = text;
        return element;
    }

    function formatCurrency(value) {
        const amount = Number(value);
        return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
    }

    function formatDateTime(value) {
        if (!value) return 'Chưa xác định';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 'Chưa xác định' : dateTimeFormatter.format(date);
    }

    function shortOrderId(orderId) {
        return `#${String(orderId || '').slice(0, 8).toUpperCase()}`;
    }

    function getStatusMeta(status) {
        return statusMeta[status] || {
            label: status || 'Không xác định',
            className: 'is-pending',
            description: 'Trạng thái đơn hàng đang được cập nhật.'
        };
    }

    function showOrdersAlert(message, type = 'success') {
        if (!elements?.alert) return;

        clearTimeout(state.alertTimer);
        elements.alert.textContent = message;
        elements.alert.className = `orders-alert ${type === 'error' ? 'is-error' : 'is-success'}`;
        elements.alert.setAttribute('role', type === 'error' ? 'alert' : 'status');
        elements.alert.hidden = false;

        state.alertTimer = setTimeout(() => {
            elements.alert.hidden = true;
        }, type === 'error' ? 8000 : 6000);
    }

    function setOrdersState(iconClass, message) {
        const stateCard = createElement('div', 'orders-state-card');
        const icon = createElement('i', iconClass);
        icon.setAttribute('aria-hidden', 'true');
        stateCard.append(icon, createElement('p', '', message));
        elements.list.replaceChildren(stateCard);
    }

    function setActiveTab(tabName, updateUrl = true) {
        const normalizedTab = tabName === 'orders' ? 'orders' : 'account';
        state.activeTab = normalizedTab;

        elements.tabs.forEach(tab => {
            const isActive = tab.dataset.profileTab === normalizedTab;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        elements.panels.forEach(panel => {
            panel.hidden = panel.dataset.profilePanel !== normalizedTab;
        });

        if (updateUrl) {
            const target = normalizedTab === 'orders'
                ? `${window.location.pathname}${window.location.search}#orders`
                : `${window.location.pathname}${window.location.search}`;
            window.history.replaceState(null, '', target);
        }

        if (normalizedTab === 'orders' && !state.hasLoaded) {
            loadOrders();
        }
    }

    function createStatusBadge(status) {
        const meta = getStatusMeta(status);
        return createElement(
            'span',
            `order-status-badge ${meta.className}`,
            meta.label
        );
    }

    function createOrderProgress(status) {
        if (status === 'cancelled') {
            const cancelled = createElement('div', 'order-cancelled-track');
            const icon = createElement('i', 'fa-solid fa-circle-xmark');
            icon.setAttribute('aria-hidden', 'true');
            cancelled.append(icon, createElement('span', '', 'Đơn hàng đã được hủy'));
            return cancelled;
        }

        const progress = createElement('div', 'order-progress');
        const steps = [
            { status: 'pending', label: 'Đã tiếp nhận' },
            { status: 'processing', label: 'Đang xử lý' },
            { status: 'completed', label: 'Hoàn thành' }
        ];
        const currentIndex = Math.max(0, steps.findIndex(step => step.status === status));

        steps.forEach((step, index) => {
            const isComplete = index < currentIndex || status === 'completed';
            const isCurrent = index === currentIndex && status !== 'completed';
            const stepElement = createElement(
                'div',
                `order-progress-step${isComplete ? ' is-complete' : ''}${isCurrent ? ' is-current' : ''}`
            );
            const dot = createElement(
                'span',
                'order-progress-dot',
                isComplete ? '✓' : String(index + 1)
            );
            stepElement.append(dot, createElement('span', '', step.label));
            progress.appendChild(stepElement);
        });

        return progress;
    }

    function createMetaItem(label, value) {
        const item = createElement('div', 'profile-order-meta-item');
        item.append(
            createElement('span', '', label),
            createElement('strong', '', value)
        );
        return item;
    }

    function canCancelOrder(order) {
        return order.status === 'pending' && Boolean(order.inventory_deducted_at);
    }

    function createActionButton(label, className, iconClass) {
        const button = createElement('button', `order-action-btn ${className}`);
        button.type = 'button';
        const icon = createElement('i', iconClass);
        icon.setAttribute('aria-hidden', 'true');
        button.append(icon, createElement('span', '', label));
        return button;
    }

    function createCancelUnavailableNote() {
        const note = createElement('p', 'order-action-note');
        const icon = createElement('i', 'fa-solid fa-circle-info');
        icon.setAttribute('aria-hidden', 'true');
        note.append(
            icon,
            createElement(
                'span',
                '',
                'Đơn cũ chưa có dấu xác nhận đã trừ tồn kho; vui lòng liên hệ cửa hàng để được hỗ trợ.'
            )
        );
        return note;
    }

    function renderOrderCard(order) {
        const card = createElement('article', 'profile-order-card');
        card.dataset.orderId = order.id;

        const header = createElement('header', 'profile-order-card-header');
        const identity = createElement('div');
        const orderId = createElement('p', 'profile-order-id', `Đơn hàng ${shortOrderId(order.id)}`);
        orderId.title = order.id;
        identity.append(
            orderId,
            createElement('p', 'profile-order-date', `Đặt lúc ${formatDateTime(order.created_at)}`)
        );
        header.append(identity, createStatusBadge(order.status));

        const body = createElement('div', 'profile-order-card-body');
        const firstItem = order.items[0];
        const totalUnits = order.items.reduce(
            (total, item) => total + (Number(item.quantity) || 0),
            0
        );
        const productSummary = createElement('div', 'profile-order-product-summary');
        const productIcon = createElement('span', 'profile-order-product-icon');
        productIcon.appendChild(createElement('i', 'fa-solid fa-microchip'));
        const productCopy = createElement('div', 'profile-order-product-copy');
        productCopy.append(
            createElement(
                'strong',
                '',
                firstItem?.product_name || 'Đang cập nhật chi tiết sản phẩm'
            ),
            createElement(
                'span',
                '',
                order.items.length > 1
                    ? `${numberFormatter.format(order.items.length)} sản phẩm · ${numberFormatter.format(totalUnits)} đơn vị`
                    : `${numberFormatter.format(totalUnits)} đơn vị`
            )
        );
        productSummary.append(productIcon, productCopy);

        const meta = createElement('div', 'profile-order-meta');
        meta.append(
            createMetaItem('Tổng tiền', formatCurrency(order.total_price)),
            createMetaItem('Giao hàng', order.shipping_method || 'Tiêu chuẩn'),
            createMetaItem('Người nhận', order.receiver_name || 'Chưa cập nhật')
        );
        body.append(productSummary, meta, createOrderProgress(order.status));

        const footer = createElement('footer', 'profile-order-card-footer');
        const detailsButton = createActionButton(
            'Xem chi tiết',
            'is-detail',
            'fa-solid fa-eye'
        );
        detailsButton.addEventListener('click', () => openOrderDetails(order.id, detailsButton));

        if (order.status === 'pending') {
            if (canCancelOrder(order)) {
                const cancelButton = createActionButton(
                    'Hủy đơn',
                    'is-cancel',
                    'fa-solid fa-ban'
                );
                cancelButton.addEventListener('click', () => cancelOrder(order, cancelButton));
                footer.append(cancelButton);
            } else {
                footer.append(createCancelUnavailableNote());
            }
        }

        footer.append(detailsButton);
        card.append(header, body, footer);
        return card;
    }

    function renderOrders(orders) {
        elements.list.replaceChildren();

        if (!orders.length) {
            setOrdersState(
                'fa-solid fa-box-open',
                state.status
                    ? 'Không có đơn hàng nào ở trạng thái này.'
                    : 'Bạn chưa có đơn hàng nào. Các đơn checkout thành công sẽ xuất hiện tại đây.'
            );
            return;
        }

        const fragment = document.createDocumentFragment();
        orders.forEach(order => fragment.appendChild(renderOrderCard(order)));
        elements.list.appendChild(fragment);
    }

    function renderPagination() {
        elements.pagination.replaceChildren();
        const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
        if (state.total <= PAGE_SIZE) return;

        const previous = createElement('button', '', 'Trước');
        previous.type = 'button';
        previous.disabled = state.page <= 1;
        previous.addEventListener('click', () => {
            state.page -= 1;
            loadOrders();
        });

        const next = createElement('button', '', 'Sau');
        next.type = 'button';
        next.disabled = state.page >= totalPages;
        next.addEventListener('click', () => {
            state.page += 1;
            loadOrders();
        });

        elements.pagination.append(
            previous,
            createElement('span', '', `Trang ${numberFormatter.format(state.page)} / ${numberFormatter.format(totalPages)}`),
            next
        );
    }

    function mapItemsToOrders(orders, items) {
        const itemsByOrderId = new Map();
        items.forEach(item => {
            const orderItems = itemsByOrderId.get(item.order_id) || [];
            orderItems.push(item);
            itemsByOrderId.set(item.order_id, orderItems);
        });

        return orders.map(order => ({
            ...order,
            items: itemsByOrderId.get(order.id) || []
        }));
    }

    function toOrdersError(error) {
        const message = String(error?.message || '');

        if (error?.code === 'PGRST202' || /cancel_pending_order/i.test(message)) {
            return 'Database chưa cài migration quản lý đơn hàng.';
        }

        if (/inventory deduction.*cannot be verified/i.test(message)) {
            return 'Đơn hàng này chưa có dấu xác nhận đã trừ tồn kho nên không thể hủy tự động.';
        }

        if (/Only a pending order/i.test(message)) {
            return 'Chỉ đơn hàng đang chờ xác nhận mới có thể hủy.';
        }

        if (/does not exist or does not belong/i.test(message)) {
            return 'Không tìm thấy đơn hàng thuộc tài khoản hiện tại.';
        }

        if (/Authentication required/i.test(message) || error?.code === '42501') {
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }

        if (/column .*inventory_/i.test(message) || error?.code === '42703') {
            return 'Database chưa chạy migration quản lý đơn hàng mới nhất.';
        }

        return 'Không thể xử lý đơn hàng lúc này. Vui lòng thử lại.';
    }

    async function loadOrders(showRefreshMessage = false) {
        if (!state.client || !state.user || state.activeTab !== 'orders') return;

        const requestId = ++state.requestId;
        const from = (state.page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        elements.list.setAttribute('aria-busy', 'true');
        elements.refresh.disabled = true;
        setOrdersState('fa-solid fa-spinner fa-spin', 'Đang tải đơn hàng từ database...');

        try {
            let query = state.client
                .from('orders')
                .select(
                    'id, user_id, receiver_name, total_price, status, shipping_method, created_at, updated_at, inventory_deducted_at, inventory_restored_at, cancelled_at',
                    { count: 'exact' }
                )
                .eq('user_id', state.user.id);

            if (state.status) {
                query = query.eq('status', state.status);
            }

            const { data: orders, error, count } = await query
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })
                .range(from, to);

            if (requestId !== state.requestId) return;
            if (error) throw error;

            state.total = Number(count) || 0;
            const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
            if (state.total > 0 && state.page > totalPages) {
                state.page = totalPages;
                await loadOrders(showRefreshMessage);
                return;
            }

            const orderIds = (orders || []).map(order => order.id);
            let items = [];
            if (orderIds.length) {
                const { data: itemRows, error: itemsError } = await state.client
                    .from('order_items')
                    .select('id, order_id, product_id, product_name, product_sku, quantity, price_at_purchase, created_at')
                    .in('order_id', orderIds)
                    .order('created_at', { ascending: true })
                    .order('id', { ascending: true });

                if (requestId !== state.requestId) return;
                if (itemsError) throw itemsError;
                items = itemRows || [];
            }

            const enrichedOrders = mapItemsToOrders(orders || [], items);
            renderOrders(enrichedOrders);
            renderPagination();
            elements.count.textContent = `${numberFormatter.format(state.total)} đơn hàng`;
            state.hasLoaded = true;
            state.lastLoadedAt = Date.now();

            if (showRefreshMessage) {
                showOrdersAlert('Danh sách đơn hàng đã được cập nhật từ database.');
            }
        } catch (error) {
            if (requestId !== state.requestId) return;
            console.error('Không thể tải đơn hàng trong profile:', error);
            state.total = 0;
            elements.count.textContent = 'Lỗi tải dữ liệu';
            elements.pagination.replaceChildren();
            setOrdersState('fa-solid fa-triangle-exclamation', toOrdersError(error));
        } finally {
            if (requestId === state.requestId) {
                elements.list.removeAttribute('aria-busy');
                elements.refresh.disabled = false;
            }
        }
    }

    function getOrderDialog() {
        let dialog = document.getElementById('profile-order-dialog');
        if (dialog) return dialog;

        dialog = createElement('dialog', 'profile-order-dialog');
        dialog.id = 'profile-order-dialog';

        const header = createElement('header', 'order-detail-header');
        const title = createElement('h2', '', 'Chi tiết đơn hàng');
        title.id = 'profile-order-dialog-title';
        const closeButton = createElement('button', 'order-detail-close', '×');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Đóng chi tiết đơn hàng');
        closeButton.addEventListener('click', () => dialog.close());
        header.append(title, closeButton);

        const content = createElement('div', 'order-detail-content');
        content.id = 'profile-order-dialog-content';
        dialog.append(header, content);
        dialog.setAttribute('aria-labelledby', title.id);
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });
        document.body.appendChild(dialog);
        return dialog;
    }

    function addDetailField(container, label, value, isFull = false) {
        const field = createElement('div', `order-detail-field${isFull ? ' is-full' : ''}`);
        field.append(
            createElement('span', '', label),
            createElement('strong', '', value || '—')
        );
        container.appendChild(field);
    }

    function renderOrderDetails(order, items) {
        const dialog = getOrderDialog();
        const title = dialog.querySelector('#profile-order-dialog-title');
        const content = dialog.querySelector('#profile-order-dialog-content');
        const status = getStatusMeta(order.status);

        title.textContent = `Chi tiết đơn ${shortOrderId(order.id)}`;
        content.replaceChildren();

        const statusRow = createElement('div', 'profile-order-card-header');
        const statusCopy = createElement('div');
        statusCopy.append(
            createElement('p', 'profile-order-id', status.label),
            createElement('p', 'profile-order-date', status.description)
        );
        statusRow.append(statusCopy, createStatusBadge(order.status));
        content.append(statusRow, createOrderProgress(order.status));

        const summary = createElement('div', 'order-detail-summary');
        addDetailField(summary, 'Mã đơn đầy đủ', order.id, true);
        addDetailField(summary, 'Ngày đặt', formatDateTime(order.created_at));
        addDetailField(
            summary,
            order.status === 'cancelled' ? 'Thời điểm hủy' : 'Cập nhật gần nhất',
            formatDateTime(order.cancelled_at || order.updated_at)
        );
        addDetailField(summary, 'Người nhận', order.receiver_name);
        addDetailField(summary, 'Số điện thoại', order.receiver_phone);
        addDetailField(summary, 'Hình thức giao', order.shipping_method || 'Tiêu chuẩn');
        addDetailField(summary, 'Tổng tiền', formatCurrency(order.total_price));
        addDetailField(summary, 'Địa chỉ giao hàng', order.shipping_address, true);
        addDetailField(summary, 'Ghi chú', order.note || 'Không có ghi chú', true);
        content.appendChild(summary);

        content.appendChild(createElement('h3', 'order-detail-section-title', 'Sản phẩm trong đơn'));
        const itemsContainer = createElement('div', 'order-detail-items');
        items.forEach(item => {
            const row = createElement('div', 'order-detail-item');
            const product = createElement('div');
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price_at_purchase) || 0;
            product.append(
                createElement('strong', '', item.product_name || 'Sản phẩm'),
                createElement(
                    'span',
                    '',
                    `SKU: ${item.product_sku || '—'} · ${numberFormatter.format(quantity)} × ${formatCurrency(price)}`
                )
            );
            row.append(
                product,
                createElement('div', 'order-detail-item-total', formatCurrency(quantity * price))
            );
            itemsContainer.appendChild(row);
        });

        if (!items.length) {
            itemsContainer.appendChild(
                createElement('div', 'orders-state-card', 'Không tìm thấy chi tiết sản phẩm.')
            );
        }
        content.appendChild(itemsContainer);

        if (order.status === 'pending') {
            const actions = createElement('div', 'order-detail-actions');
            if (canCancelOrder(order)) {
                const cancelButton = createActionButton(
                    'Hủy đơn và hoàn tồn kho',
                    'is-cancel',
                    'fa-solid fa-ban'
                );
                cancelButton.addEventListener('click', () => cancelOrder(order, cancelButton));
                actions.appendChild(cancelButton);
            } else {
                actions.appendChild(createCancelUnavailableNote());
            }
            content.appendChild(actions);
        }

        if (typeof dialog.showModal === 'function') {
            if (!dialog.open) dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    async function openOrderDetails(orderId, triggerButton) {
        const originalContent = [...triggerButton.childNodes].map(node => node.cloneNode(true));
        triggerButton.disabled = true;
        triggerButton.replaceChildren(
            createElement('i', 'fa-solid fa-spinner fa-spin'),
            createElement('span', '', 'Đang tải...')
        );

        try {
            const orderPromise = state.client
                .from('orders')
                .select(
                    'id, user_id, receiver_name, receiver_phone, shipping_address, shipping_method, total_price, status, note, created_at, updated_at, inventory_deducted_at, inventory_restored_at, cancelled_at'
                )
                .eq('id', orderId)
                .eq('user_id', state.user.id)
                .maybeSingle();
            const itemsPromise = state.client
                .from('order_items')
                .select('id, order_id, product_id, product_name, product_sku, quantity, price_at_purchase, created_at')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true });

            const [orderResult, itemsResult] = await Promise.all([orderPromise, itemsPromise]);
            if (orderResult.error) throw orderResult.error;
            if (itemsResult.error) throw itemsResult.error;
            if (!orderResult.data) throw new Error('Không tìm thấy đơn hàng thuộc tài khoản hiện tại.');

            renderOrderDetails(orderResult.data, itemsResult.data || []);
        } catch (error) {
            console.error('Không thể tải chi tiết đơn hàng:', error);
            showOrdersAlert(toOrdersError(error), 'error');
        } finally {
            triggerButton.disabled = false;
            triggerButton.replaceChildren(...originalContent);
        }
    }

    async function cancelOrder(order, button) {
        if (!canCancelOrder(order)) {
            showOrdersAlert(
                'Đơn hàng này chưa đủ điều kiện hủy tự động và hoàn tồn kho.',
                'error'
            );
            return;
        }

        const confirmed = window.confirm(
            `Hủy đơn ${shortOrderId(order.id)}?\n\n`
            + 'Đơn sẽ chuyển sang “Đã hủy” và database hoàn lại đúng số lượng của từng sản phẩm.'
        );
        if (!confirmed) return;

        const originalContent = [...button.childNodes].map(node => node.cloneNode(true));
        button.disabled = true;
        button.replaceChildren(
            createElement('i', 'fa-solid fa-spinner fa-spin'),
            createElement('span', '', 'Đang hủy...')
        );

        try {
            const { data, error } = await state.client.rpc('cancel_pending_order', {
                p_order_id: order.id
            });
            if (error) throw error;

            const returnedOrderId = data?.order_id;
            if (returnedOrderId !== order.id || data?.status !== 'cancelled') {
                throw new Error('Database không trả về kết quả hủy đơn hợp lệ.');
            }

            const restoredUnits = Number(data.restored_units) || 0;
            const message = data.already_cancelled
                ? `Đơn ${shortOrderId(order.id)} đã được hủy trước đó; tồn kho không bị cộng lại lần hai.`
                : `Đã hủy đơn ${shortOrderId(order.id)} và hoàn ${numberFormatter.format(restoredUnits)} đơn vị sản phẩm vào kho.`;

            const dialog = document.getElementById('profile-order-dialog');
            if (dialog?.open) dialog.close();
            showOrdersAlert(message);
            await loadOrders();
        } catch (error) {
            console.error('Không thể hủy đơn hàng:', error);
            showOrdersAlert(toOrdersError(error), 'error');
        } finally {
            if (button.isConnected) {
                button.disabled = false;
                button.replaceChildren(...originalContent);
            }
        }
    }

    async function initializeProfileOrders() {
        elements = {
            tabs: [...document.querySelectorAll('[data-profile-tab]')],
            panels: [...document.querySelectorAll('[data-profile-panel]')],
            list: document.getElementById('profile-orders-list'),
            count: document.getElementById('profile-orders-count'),
            status: document.getElementById('profile-orders-status'),
            refresh: document.getElementById('profile-orders-refresh'),
            pagination: document.getElementById('profile-orders-pagination'),
            alert: document.getElementById('profile-orders-alert')
        };

        if (
            !elements.tabs.length
            || !elements.panels.length
            || !elements.list
            || !elements.status
            || !elements.refresh
        ) {
            return;
        }

        state.client = window.supabaseClient;
        if (!state.client) {
            setActiveTab('orders', false);
            setOrdersState('fa-solid fa-triangle-exclamation', 'Không tìm thấy kết nối Supabase.');
            return;
        }

        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => setActiveTab(tab.dataset.profileTab));
            tab.addEventListener('keydown', event => {
                const currentIndex = elements.tabs.indexOf(tab);
                let targetIndex = null;

                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    targetIndex = (currentIndex - 1 + elements.tabs.length) % elements.tabs.length;
                } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    targetIndex = (currentIndex + 1) % elements.tabs.length;
                } else if (event.key === 'Home') {
                    targetIndex = 0;
                } else if (event.key === 'End') {
                    targetIndex = elements.tabs.length - 1;
                }

                if (targetIndex === null) return;
                event.preventDefault();
                const targetTab = elements.tabs[targetIndex];
                setActiveTab(targetTab.dataset.profileTab);
                targetTab.focus();
            });
        });
        elements.status.addEventListener('change', event => {
            state.status = event.target.value;
            state.page = 1;
            loadOrders();
        });
        elements.refresh.addEventListener('click', () => loadOrders(true));
        window.addEventListener('hashchange', () => {
            setActiveTab(window.location.hash === '#orders' ? 'orders' : 'account', false);
        });
        window.addEventListener('focus', () => {
            if (
                state.activeTab === 'orders'
                && state.hasLoaded
                && Date.now() - state.lastLoadedAt >= AUTO_REFRESH_INTERVAL
            ) {
                loadOrders();
            }
        });
        window.setInterval(() => {
            if (
                document.visibilityState === 'visible'
                && state.activeTab === 'orders'
                && state.hasLoaded
                && !elements.list.hasAttribute('aria-busy')
                && Date.now() - state.lastLoadedAt >= AUTO_REFRESH_INTERVAL
            ) {
                loadOrders();
            }
        }, AUTO_REFRESH_INTERVAL);

        const { data, error } = await state.client.auth.getUser();
        if (error || !data?.user) {
            if (window.location.hash === '#orders') {
                setActiveTab('orders', false);
                setOrdersState(
                    'fa-solid fa-user-lock',
                    'Bạn cần đăng nhập để xem danh sách đơn hàng.'
                );
            }
            return;
        }

        state.user = data.user;
        setActiveTab(window.location.hash === '#orders' ? 'orders' : 'account', false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfileOrders, { once: true });
    } else {
        initializeProfileOrders();
    }
})();
