(() => {
    'use strict';

    const PAGE_SIZE = 5;
    const STOCK_THRESHOLD = 50;
    const MAX_ID_LOOKUP_ROWS = 1000;

    const numberFormatter = new Intl.NumberFormat('vi-VN');
    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
    });

    const orderStatusMeta = Object.freeze({
        pending: { label: 'Chờ duyệt', className: 'pending' },
        processing: { label: 'Đang giao', className: 'shipping' },
        completed: { label: 'Hoàn thành', className: 'completed' },
        cancelled: { label: 'Đã hủy', className: 'cancel' }
    });

    const orderAdvanceMeta = Object.freeze({
        pending: {
            label: 'Chuyển sang đang giao',
            icon: 'fa-truck-fast'
        },
        processing: {
            label: 'Đánh dấu hoàn thành',
            icon: 'fa-circle-check'
        }
    });

    const categoryIcon = Object.freeze({
        phone: 'fa-mobile-screen-button',
        laptop: 'fa-laptop',
        pc: 'fa-desktop',
        phukien: 'fa-headphones'
    });

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined && text !== null) element.textContent = String(text);
        return element;
    }

    function createIcon(iconName) {
        const icon = document.createElement('i');
        icon.className = `fa-solid ${iconName}`;
        icon.setAttribute('aria-hidden', 'true');
        return icon;
    }

    function createTextCell(value, className) {
        return createElement('td', className, value);
    }

    function formatCurrency(value) {
        return currencyFormatter.format(Number(value) || 0);
    }

    function formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
    }

    function sanitizeSearch(value) {
        return String(value || '')
            .trim()
            .slice(0, 80)
            .replace(/[^\p{L}\p{N}\s@.#-]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function debounce(callback, delay = 300) {
        let timeoutId;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => callback(...args), delay);
        };
    }

    function setTableMessage(tbody, columnCount, message, type = '') {
        tbody.replaceChildren();
        const row = document.createElement('tr');
        const cell = createElement('td', `table-state${type ? ` ${type}` : ''}`, message);
        cell.colSpan = columnCount;
        row.appendChild(cell);
        tbody.appendChild(row);
    }

    function getPaginationTokens(currentPage, totalPages) {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
        if (currentPage <= 4) {
            pages.add(2);
            pages.add(3);
            pages.add(4);
        }
        if (currentPage >= totalPages - 3) {
            pages.add(totalPages - 1);
            pages.add(totalPages - 2);
            pages.add(totalPages - 3);
        }

        const sortedPages = [...pages]
            .filter((page) => page >= 1 && page <= totalPages)
            .sort((left, right) => left - right);

        const tokens = [];
        sortedPages.forEach((page, index) => {
            const previousPage = sortedPages[index - 1];
            if (previousPage && page - previousPage > 1) tokens.push('ellipsis');
            tokens.push(page);
        });
        return tokens;
    }

    function createPageButton(label, options) {
        const button = createElement('button', 'page-btn');
        button.type = 'button';
        button.disabled = Boolean(options.disabled);
        button.setAttribute('aria-label', options.ariaLabel || String(label));

        if (options.icon) {
            button.appendChild(createIcon(options.icon));
        } else {
            button.textContent = String(label);
        }

        if (options.active) {
            button.classList.add('active');
            button.setAttribute('aria-current', 'page');
        }
        if (!button.disabled && typeof options.onClick === 'function') {
            button.addEventListener('click', options.onClick);
        }
        return button;
    }

    function renderPagination(container, currentPage, totalPages, onPageChange) {
        container.replaceChildren();
        if (totalPages < 1) return;

        container.appendChild(createPageButton('Trước', {
            icon: 'fa-chevron-left',
            ariaLabel: 'Trang trước',
            disabled: currentPage <= 1,
            onClick: () => onPageChange(currentPage - 1)
        }));

        getPaginationTokens(currentPage, totalPages).forEach((token) => {
            if (token === 'ellipsis') {
                container.appendChild(createElement('span', 'pagination-ellipsis', '…'));
                return;
            }

            container.appendChild(createPageButton(token, {
                active: token === currentPage,
                ariaLabel: `Trang ${token}`,
                disabled: token === currentPage,
                onClick: () => onPageChange(token)
            }));
        });

        container.appendChild(createPageButton('Sau', {
            icon: 'fa-chevron-right',
            ariaLabel: 'Trang sau',
            disabled: currentPage >= totalPages,
            onClick: () => onPageChange(currentPage + 1)
        }));
    }

    function renderResultCount(element, total, currentPage, noun) {
        if (!total) {
            element.textContent = `Không có ${noun}`;
            return;
        }
        const from = (currentPage - 1) * PAGE_SIZE + 1;
        const to = Math.min(currentPage * PAGE_SIZE, total);
        element.textContent = `Hiển thị ${numberFormatter.format(from)}–${numberFormatter.format(to)} / ${numberFormatter.format(total)} ${noun}`;
    }

    async function requireAdmin(client) {
        const { data: userData, error: userError } = await client.auth.getUser();
        if (!userData?.user) {
            throw new Error('Bạn cần đăng nhập bằng tài khoản quản trị viên.');
        }
        if (userError) throw userError;

        const { data: profile, error: profileError } = await client
            .from('users')
            .select('role')
            .eq('id', userData.user.id)
            .single();

        if (profileError) throw profileError;
        if (profile?.role !== 'admin') {
            throw new Error('Tài khoản hiện tại không có quyền quản trị viên.');
        }
    }

    function getProductAvailability(product) {
        const stock = Number(product.stock) || 0;
        if (product.status === 'hidden') {
            return { label: 'Đã ẩn', className: 'hidden' };
        }
        if (product.status === 'out_of_stock' || stock === 0) {
            return { label: 'Hết hàng', className: 'outstock' };
        }
        if (stock <= STOCK_THRESHOLD) {
            return { label: 'Sắp hết', className: 'lowstock' };
        }
        return { label: 'Còn hàng', className: 'instock' };
    }

    function getSafeImageUrl(value) {
        if (!value) return null;
        try {
            const parsed = new URL(String(value), window.location.origin);
            return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
        } catch {
            return null;
        }
    }

    function renderProductImage(product) {
        const wrapper = createElement('div', 'product-img');
        const imageUrl = getSafeImageUrl(Array.isArray(product.image_urls) ? product.image_urls[0] : null);
        const fallback = () => {
            wrapper.replaceChildren(createIcon(categoryIcon[product.category_id] || 'fa-box'));
        };

        if (!imageUrl) {
            fallback();
            return wrapper;
        }

        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = product.name || 'Sản phẩm';
        image.loading = 'lazy';
        image.addEventListener('error', fallback, { once: true });
        wrapper.appendChild(image);
        return wrapper;
    }

    function renderProductRow(product, categoryNames, onToggleVisibility) {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;

        const productCell = document.createElement('td');
        const productLayout = createElement('div', 'product-cell');
        const productText = document.createElement('div');
        productText.appendChild(createElement('div', 'product-name', product.name || 'Sản phẩm chưa đặt tên'));
        productText.appendChild(createElement('div', 'product-sku', `SKU: ${product.sku || '—'}`));
        productLayout.appendChild(renderProductImage(product));
        productLayout.appendChild(productText);
        productCell.appendChild(productLayout);
        row.appendChild(productCell);

        row.appendChild(createTextCell(categoryNames.get(product.category_id) || product.category_id || '—'));
        row.appendChild(createTextCell(formatCurrency(product.price)));
        row.appendChild(createTextCell(numberFormatter.format(Number(product.stock) || 0)));

        const statusCell = document.createElement('td');
        const availability = getProductAvailability(product);
        const badge = createElement('span', `badge ${availability.className}`, availability.label);
        badge.title = `Trạng thái database: ${product.status || 'không xác định'}`;
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        row.appendChild(createTextCell(formatDate(product.created_at)));

        const actionCell = document.createElement('td');
        const actions = createElement('div', 'action-btns');
        if (product.status === 'active' && Number(product.stock) > 0) {
            const viewLink = createElement('a', 'btn-icon view');
            viewLink.href = `/pages/chitiet-sanpham.html?id=${encodeURIComponent(product.id)}`;
            viewLink.title = 'Xem sản phẩm trên cửa hàng';
            viewLink.setAttribute('aria-label', `Xem ${product.name || 'sản phẩm'}`);
            viewLink.appendChild(createIcon('fa-eye'));
            actions.appendChild(viewLink);
        } else {
            const disabledView = createElement('button', 'btn-icon view');
            disabledView.type = 'button';
            disabledView.disabled = true;
            disabledView.title = 'Chỉ xem được trên cửa hàng khi sản phẩm đang bán và còn hàng';
            disabledView.setAttribute('aria-label', disabledView.title);
            disabledView.appendChild(createIcon('fa-eye'));
            actions.appendChild(disabledView);
        }

        const editLink = createElement('a', 'btn-icon edit');
        editLink.href = `admin-add-sanpham.html?id=${encodeURIComponent(product.id)}`;
        editLink.title = 'Chỉnh sửa sản phẩm';
        editLink.setAttribute('aria-label', `Chỉnh sửa ${product.name || 'sản phẩm'}`);
        editLink.appendChild(createIcon('fa-pen'));
        actions.appendChild(editLink);

        const isHidden = product.status === 'hidden';
        const visibilityButton = createElement(
            'button',
            `btn-icon ${isHidden ? 'restore' : 'visibility'}`
        );
        visibilityButton.type = 'button';
        visibilityButton.title = isHidden ? 'Hiển thị lại sản phẩm' : 'Ẩn sản phẩm';
        visibilityButton.setAttribute(
            'aria-label',
            `${isHidden ? 'Hiển thị lại' : 'Ẩn'} ${product.name || 'sản phẩm'}`
        );
        visibilityButton.appendChild(createIcon(isHidden ? 'fa-eye' : 'fa-eye-slash'));

        if (isHidden && Number(product.stock) <= 0) {
            visibilityButton.disabled = true;
            visibilityButton.title = 'Hãy chỉnh tồn kho lớn hơn 0 trước khi hiển thị lại';
        } else {
            visibilityButton.addEventListener('click', () => onToggleVisibility(product, visibilityButton));
        }
        actions.appendChild(visibilityButton);

        actionCell.appendChild(actions);
        row.appendChild(actionCell);

        return row;
    }

    async function initProductsPage(client) {
        const elements = {
            tbody: document.getElementById('adminProductsBody'),
            search: document.getElementById('adminProductSearch'),
            category: document.getElementById('adminProductCategory'),
            inventory: document.getElementById('adminProductInventory'),
            status: document.getElementById('adminProductStatus'),
            actionMessage: document.getElementById('adminProductActionMessage'),
            count: document.getElementById('adminProductsCount'),
            pagination: document.getElementById('adminProductsPagination')
        };
        if (Object.values(elements).some((element) => !element)) return;

        const state = {
            page: 1,
            search: '',
            category: '',
            inventory: '',
            status: '',
            requestId: 0,
            categoryNames: new Map(),
            actionMessageTimeout: null
        };

        function showActionMessage(message, type = 'success') {
            window.clearTimeout(state.actionMessageTimeout);
            elements.actionMessage.textContent = message;
            elements.actionMessage.className = `admin-action-message ${type}`;
            elements.actionMessage.hidden = false;
            state.actionMessageTimeout = window.setTimeout(() => {
                elements.actionMessage.hidden = true;
            }, 4500);
        }

        async function loadCategories() {
            const { data, error } = await client
                .from('categories')
                .select('id, name')
                .order('name', { ascending: true });
            if (error) throw error;

            const fragment = document.createDocumentFragment();
            (data || []).forEach((category) => {
                state.categoryNames.set(category.id, category.name);
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                fragment.appendChild(option);
            });
            elements.category.appendChild(fragment);
        }

        async function loadProducts() {
            const requestId = ++state.requestId;
            elements.tbody.setAttribute('aria-busy', 'true');
            setTableMessage(elements.tbody, 7, 'Đang tải sản phẩm từ Supabase...');
            elements.count.textContent = 'Đang tải...';
            elements.pagination.replaceChildren();

            try {
                const from = (state.page - 1) * PAGE_SIZE;
                const to = from + PAGE_SIZE - 1;

                let query = client
                    .from('products')
                    .select('id, sku, name, price, category_id, image_urls, stock, status, created_at, updated_at', { count: 'exact' });

                if (state.category) query = query.eq('category_id', state.category);
                if (state.inventory === 'in_stock') query = query.gt('stock', STOCK_THRESHOLD);
                if (state.inventory === 'low_stock') query = query.gte('stock', 1).lte('stock', STOCK_THRESHOLD);
                if (state.inventory === 'out_of_stock') query = query.eq('stock', 0);
                if (state.status === 'active') query = query.eq('status', 'active').gt('stock', 0);
                if (state.status === 'hidden') query = query.eq('status', 'hidden');
                if (state.status === 'out_of_stock') {
                    query = query.neq('status', 'hidden').or('status.eq.out_of_stock,stock.eq.0');
                }

                const search = sanitizeSearch(state.search);
                if (search) {
                    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
                }

                const { data, error, count } = await query
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: false })
                    .range(from, to);

                if (requestId !== state.requestId) return;
                if (error) throw error;

                const total = Number(count) || 0;
                const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
                if (total > 0 && state.page > totalPages) {
                    state.page = totalPages;
                    await loadProducts();
                    return;
                }

                elements.tbody.replaceChildren();
                if (!data?.length) {
                    setTableMessage(elements.tbody, 7, 'Không tìm thấy sản phẩm phù hợp.');
                } else {
                    const fragment = document.createDocumentFragment();
                    data.forEach((product) => fragment.appendChild(
                        renderProductRow(product, state.categoryNames, toggleProductVisibility)
                    ));
                    elements.tbody.appendChild(fragment);
                }

                renderResultCount(elements.count, total, state.page, 'sản phẩm');
                if (total > 0) {
                    renderPagination(elements.pagination, state.page, totalPages, (page) => {
                        state.page = page;
                        loadProducts();
                    });
                }
            } catch (error) {
                if (requestId !== state.requestId) return;
                console.error('Không thể tải danh sách sản phẩm:', error);
                setTableMessage(elements.tbody, 7, 'Không thể tải sản phẩm. Hãy kiểm tra đăng nhập và kết nối Supabase.', 'error');
                elements.count.textContent = 'Lỗi tải dữ liệu';
            } finally {
                if (requestId === state.requestId) elements.tbody.removeAttribute('aria-busy');
            }
        }

        async function toggleProductVisibility(product, button) {
            const isHidden = product.status === 'hidden';
            if (isHidden && Number(product.stock) <= 0) {
                showActionMessage('Hãy chỉnh tồn kho lớn hơn 0 trước khi hiển thị lại sản phẩm.', 'error');
                return;
            }

            const actionLabel = isHidden ? 'hiển thị lại' : 'ẩn';
            const consequence = isHidden
                ? 'Khách hàng sẽ có thể xem và thêm sản phẩm vào giỏ.'
                : 'Sản phẩm sẽ biến mất khỏi cửa hàng; dữ liệu đơn hàng cũ vẫn được giữ nguyên.';
            const confirmed = window.confirm(
                `Bạn có chắc muốn ${actionLabel} “${product.name || 'sản phẩm này'}”?\n\n${consequence}`
            );
            if (!confirmed) return;

            const targetStatus = isHidden ? 'active' : 'hidden';
            button.disabled = true;
            button.replaceChildren(createIcon('fa-spinner fa-spin'));

            try {
                let visibilityQuery = client
                    .from('products')
                    .update({ status: targetStatus })
                    .eq('id', product.id);
                visibilityQuery = product.updated_at == null
                    ? visibilityQuery.is('updated_at', null)
                    : visibilityQuery.eq('updated_at', product.updated_at);

                const { data, error } = await visibilityQuery
                    .select('id, status, stock, updated_at')
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    const conflictError = new Error('Không thể cập nhật vì sản phẩm đã thay đổi, đã bị xóa hoặc quyền admin không còn hợp lệ. Danh sách sẽ được tải lại.');
                    conflictError.code = 'EDIT_CONFLICT';
                    throw conflictError;
                }

                showActionMessage(
                    isHidden
                        ? `Đã hiển thị lại “${product.name || 'sản phẩm'}”.`
                        : `Đã ẩn “${product.name || 'sản phẩm'}” khỏi cửa hàng.`
                );
                await loadProducts();
            } catch (error) {
                console.error(`Không thể ${actionLabel} sản phẩm:`, error);
                const message = error?.code === '42501'
                    ? 'Bạn không có quyền cập nhật sản phẩm.'
                    : (error?.message || `Không thể ${actionLabel} sản phẩm. Vui lòng thử lại.`);
                showActionMessage(message, 'error');
                if (error?.code === 'EDIT_CONFLICT') await loadProducts();
            } finally {
                button.disabled = false;
                button.replaceChildren(createIcon(isHidden ? 'fa-eye' : 'fa-eye-slash'));
            }
        }

        const debouncedProductSearch = debounce(() => loadProducts());
        elements.search.addEventListener('input', (event) => {
            state.search = event.target.value;
            state.page = 1;
            state.requestId += 1;
            debouncedProductSearch();
        });
        elements.category.addEventListener('change', (event) => {
            state.category = event.target.value;
            state.page = 1;
            loadProducts();
        });
        elements.inventory.addEventListener('change', (event) => {
            state.inventory = event.target.value;
            state.page = 1;
            loadProducts();
        });
        elements.status.addEventListener('change', (event) => {
            state.status = event.target.value;
            state.page = 1;
            loadProducts();
        });

        try {
            await loadCategories();
        } catch (error) {
            console.error('Không thể tải danh mục sản phẩm:', error);
        }
        await loadProducts();
    }

    function isUuid(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    function isShortOrderIdSearch(value) {
        const normalized = value.replace(/^#/, '').replace(/-/g, '');
        return (/^#/.test(value) && /^[0-9a-f]{4,32}$/i.test(normalized))
            || (/^[0-9a-f]{8,32}$/i.test(normalized) && /[a-f]/i.test(normalized));
    }

    async function findOrderIdsByPrefix(client, search) {
        const normalized = search.replace(/^#/, '').replace(/-/g, '').toLowerCase();
        const { data, error } = await client
            .from('orders')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(MAX_ID_LOOKUP_ROWS);
        if (error) throw error;

        return (data || [])
            .map((row) => row.id)
            .filter((id) => String(id).replace(/-/g, '').toLowerCase().startsWith(normalized));
    }

    async function loadOrderRelations(client, orders) {
        if (!orders.length) return [];
        const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))];
        const orderIds = orders.map((order) => order.id);

        const usersPromise = userIds.length
            ? client.from('users').select('id, display_name, email').in('id', userIds)
            : Promise.resolve({ data: [], error: null });
        const itemsPromise = client
            .from('order_items')
            .select('id, order_id, product_id, product_name, product_sku, quantity, price_at_purchase, created_at')
            .in('order_id', orderIds)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true });

        const [usersResult, itemsResult] = await Promise.all([usersPromise, itemsPromise]);
        if (usersResult.error) throw usersResult.error;
        if (itemsResult.error) throw itemsResult.error;

        const usersById = new Map((usersResult.data || []).map((user) => [user.id, user]));
        const itemsByOrderId = new Map();
        (itemsResult.data || []).forEach((item) => {
            const items = itemsByOrderId.get(item.order_id) || [];
            items.push(item);
            itemsByOrderId.set(item.order_id, items);
        });

        return orders.map((order) => ({
            ...order,
            customer: usersById.get(order.user_id) || null,
            items: itemsByOrderId.get(order.id) || []
        }));
    }

    function addDetailField(grid, label, value, full = false) {
        const field = createElement('div', `order-detail-field${full ? ' full' : ''}`);
        field.appendChild(createElement('span', 'order-detail-label', label));
        field.appendChild(createElement('div', 'order-detail-value', value || '—'));
        grid.appendChild(field);
    }

    function getOrderDetailDialog() {
        let dialog = document.getElementById('adminOrderDetailDialog');
        if (dialog) return dialog;

        dialog = createElement('dialog', 'order-detail-dialog');
        dialog.id = 'adminOrderDetailDialog';

        const header = createElement('div', 'order-detail-header');
        const title = createElement('h2', '', 'Chi tiết đơn hàng');
        title.id = 'adminOrderDetailTitle';
        const closeButton = createElement('button', 'order-detail-close', '×');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Đóng chi tiết đơn hàng');
        closeButton.addEventListener('click', () => dialog.close());
        header.append(title, closeButton);

        const body = createElement('div', 'order-detail-body');
        body.id = 'adminOrderDetailBody';
        dialog.append(header, body);
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });
        document.body.appendChild(dialog);
        return dialog;
    }

    function showOrderDetails(order) {
        const dialog = getOrderDetailDialog();
        const body = dialog.querySelector('#adminOrderDetailBody');
        const title = dialog.querySelector('#adminOrderDetailTitle');
        const status = orderStatusMeta[order.status] || { label: order.status || 'Không xác định' };
        const receiverName = order.receiver_name || order.customer?.display_name || 'Khách hàng';

        title.textContent = `Đơn #${String(order.id).slice(0, 8).toUpperCase()}`;
        body.replaceChildren();

        const grid = createElement('div', 'order-detail-grid');
        addDetailField(grid, 'Mã đơn đầy đủ', order.id, true);
        addDetailField(grid, 'Người nhận', receiverName);
        addDetailField(grid, 'Email tài khoản', order.customer?.email);
        addDetailField(grid, 'Số điện thoại', order.receiver_phone);
        addDetailField(grid, 'Ngày đặt', formatDate(order.created_at));
        addDetailField(grid, 'Hình thức giao', order.shipping_method);
        addDetailField(grid, 'Trạng thái', status.label);
        addDetailField(grid, 'Tổng tiền', formatCurrency(order.total_price));
        addDetailField(grid, 'Địa chỉ giao hàng', order.shipping_address, true);
        addDetailField(grid, 'Ghi chú', order.note, true);
        body.appendChild(grid);

        body.appendChild(createElement('h3', '', 'Sản phẩm trong đơn'));
        const table = createElement('table', 'order-detail-items');
        const head = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['Sản phẩm', 'SKU', 'SL', 'Đơn giá', 'Thành tiền'].forEach((label) => {
            headRow.appendChild(createElement('th', '', label));
        });
        head.appendChild(headRow);
        table.appendChild(head);

        const tableBody = document.createElement('tbody');
        if (!order.items.length) {
            const emptyRow = document.createElement('tr');
            const emptyCell = createElement('td', 'table-state', 'Không có chi tiết sản phẩm.');
            emptyCell.colSpan = 5;
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
        } else {
            order.items.forEach((item) => {
                const row = document.createElement('tr');
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.price_at_purchase) || 0;
                row.appendChild(createTextCell(item.product_name || 'Sản phẩm'));
                row.appendChild(createTextCell(item.product_sku || '—'));
                row.appendChild(createTextCell(numberFormatter.format(quantity)));
                row.appendChild(createTextCell(formatCurrency(unitPrice)));
                row.appendChild(createTextCell(formatCurrency(quantity * unitPrice)));
                tableBody.appendChild(row);
            });
        }
        table.appendChild(tableBody);
        body.appendChild(table);

        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
    }

    async function loadOrderPrivateDetails(client, order) {
        const { data, error } = await client
            .from('orders')
            .select('receiver_phone, shipping_address, note')
            .eq('id', order.id)
            .single();
        if (error) throw error;
        return { ...order, ...data };
    }

    function renderOrderRow(order, client, refreshOrders) {
        const row = document.createElement('tr');
        row.dataset.orderId = order.id;

        const shortId = `#${String(order.id).slice(0, 8).toUpperCase()}`;
        const idCell = document.createElement('td');
        const idText = createElement('strong', '', shortId);
        idText.title = order.id;
        idCell.appendChild(idText);
        row.appendChild(idCell);

        const customerCell = document.createElement('td');
        const receiverName = order.receiver_name || order.customer?.display_name || 'Khách hàng';
        const customerName = createElement('div', '', receiverName);
        customerName.style.fontWeight = '600';
        const customerEmail = createElement('div', '', order.customer?.email || order.receiver_phone || '—');
        customerEmail.style.fontSize = '12px';
        customerEmail.style.color = '#9ca3af';
        customerCell.append(customerName, customerEmail);
        row.appendChild(customerCell);

        const productCell = document.createElement('td');
        const productSummary = createElement('div', 'order-product-summary');
        const firstItem = order.items[0];
        if (firstItem) {
            productSummary.appendChild(createElement(
                'span',
                '',
                `${firstItem.product_name || 'Sản phẩm'} × ${numberFormatter.format(Number(firstItem.quantity) || 0)}`
            ));
            if (order.items.length > 1) {
                productSummary.appendChild(createElement(
                    'span',
                    'order-product-more',
                    `+${numberFormatter.format(order.items.length - 1)} sản phẩm khác`
                ));
            }
        } else {
            productSummary.textContent = 'Không có chi tiết';
        }
        productCell.appendChild(productSummary);
        row.appendChild(productCell);

        const totalCell = createTextCell(formatCurrency(order.total_price));
        const totalText = createElement('strong', '', totalCell.textContent);
        totalCell.replaceChildren(totalText);
        row.appendChild(totalCell);
        row.appendChild(createTextCell(order.shipping_method || 'Tiêu chuẩn'));
        row.appendChild(createTextCell(formatDate(order.created_at)));

        const statusCell = document.createElement('td');
        const status = orderStatusMeta[order.status] || {
            label: order.status || 'Không xác định',
            className: 'pending'
        };
        statusCell.appendChild(createElement('span', `badge ${status.className}`, status.label));
        row.appendChild(statusCell);

        const actionCell = document.createElement('td');
        const actions = createElement('div', 'action-btns');
        const advance = orderAdvanceMeta[order.status];

        if (advance) {
            const advanceButton = createElement('button', 'btn-icon edit');
            advanceButton.type = 'button';
            advanceButton.title = advance.label;
            advanceButton.setAttribute(
                'aria-label',
                `${advance.label} cho đơn ${shortId}`
            );
            advanceButton.appendChild(createIcon(advance.icon));
            advanceButton.addEventListener('click', async () => {
                advanceButton.disabled = true;
                advanceButton.replaceChildren(createIcon('fa-spinner fa-spin'));

                try {
                    const { error } = await client.rpc('advance_order_status', {
                        p_order_id: order.id,
                        p_expected_status: order.status
                    });
                    if (error) throw error;

                    await refreshOrders();
                } catch (error) {
                    console.error('Không thể cập nhật trạng thái đơn hàng:', error);
                    window.alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
                } finally {
                    if (advanceButton.isConnected) {
                        advanceButton.disabled = false;
                        advanceButton.replaceChildren(createIcon(advance.icon));
                    }
                }
            });
            actions.appendChild(advanceButton);
        }

        const viewButton = createElement('button', 'btn-icon view');
        viewButton.type = 'button';
        viewButton.title = 'Xem chi tiết';
        viewButton.setAttribute('aria-label', `Xem chi tiết đơn ${shortId}`);
        viewButton.appendChild(createIcon('fa-eye'));
        viewButton.addEventListener('click', async () => {
            viewButton.disabled = true;
            viewButton.replaceChildren(createIcon('fa-spinner fa-spin'));
            try {
                const orderWithPrivateDetails = await loadOrderPrivateDetails(client, order);
                showOrderDetails(orderWithPrivateDetails);
            } catch (error) {
                console.error('Không thể tải chi tiết đơn hàng:', error);
                window.alert('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
            } finally {
                viewButton.disabled = false;
                viewButton.replaceChildren(createIcon('fa-eye'));
            }
        });
        actions.appendChild(viewButton);
        actionCell.appendChild(actions);
        row.appendChild(actionCell);

        return row;
    }

    async function initOrdersPage(client) {
        const elements = {
            tbody: document.getElementById('adminOrdersBody'),
            search: document.getElementById('adminOrderSearch'),
            status: document.getElementById('adminOrderStatus'),
            shipping: document.getElementById('adminOrderShipping'),
            count: document.getElementById('adminOrdersCount'),
            pagination: document.getElementById('adminOrdersPagination')
        };
        if (Object.values(elements).some((element) => !element)) return;

        const state = {
            page: 1,
            search: '',
            status: '',
            shipping: '',
            requestId: 0
        };

        async function loadOrders() {
            const requestId = ++state.requestId;
            elements.tbody.setAttribute('aria-busy', 'true');
            setTableMessage(elements.tbody, 8, 'Đang tải đơn hàng từ Supabase...');
            elements.count.textContent = 'Đang tải...';
            elements.pagination.replaceChildren();

            try {
                const from = (state.page - 1) * PAGE_SIZE;
                const to = from + PAGE_SIZE - 1;
                const search = sanitizeSearch(state.search);

                let query = client
                    .from('orders')
                    .select(
                        'id, user_id, receiver_name, shipping_method, total_price, status, created_at',
                        { count: 'exact' }
                    );

                if (state.status) query = query.eq('status', state.status);
                if (state.shipping) query = query.eq('shipping_method', state.shipping);

                if (search) {
                    if (isUuid(search)) {
                        query = query.eq('id', search);
                    } else if (isShortOrderIdSearch(search)) {
                        const matchingIds = await findOrderIdsByPrefix(client, search);
                        if (requestId !== state.requestId) return;
                        if (!matchingIds.length) {
                            elements.tbody.replaceChildren();
                            setTableMessage(elements.tbody, 8, 'Không tìm thấy đơn hàng phù hợp.');
                            renderResultCount(elements.count, 0, 1, 'đơn hàng');
                            elements.pagination.replaceChildren();
                            return;
                        }
                        query = query.in('id', matchingIds);
                    } else {
                        query = query.or(`receiver_name.ilike.%${search}%,receiver_phone.ilike.%${search}%`);
                    }
                }

                const { data, error, count } = await query
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: false })
                    .range(from, to);

                if (requestId !== state.requestId) return;
                if (error) throw error;

                const total = Number(count) || 0;
                const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
                if (total > 0 && state.page > totalPages) {
                    state.page = totalPages;
                    await loadOrders();
                    return;
                }

                const orders = await loadOrderRelations(client, data || []);
                if (requestId !== state.requestId) return;

                elements.tbody.replaceChildren();
                if (!orders.length) {
                    setTableMessage(elements.tbody, 8, 'Không tìm thấy đơn hàng phù hợp.');
                } else {
                    const fragment = document.createDocumentFragment();
                    orders.forEach((order) => {
                        fragment.appendChild(renderOrderRow(order, client, loadOrders));
                    });
                    elements.tbody.appendChild(fragment);
                }

                renderResultCount(elements.count, total, state.page, 'đơn hàng');
                if (total > 0) {
                    renderPagination(elements.pagination, state.page, totalPages, (page) => {
                        state.page = page;
                        loadOrders();
                    });
                }
            } catch (error) {
                if (requestId !== state.requestId) return;
                console.error('Không thể tải danh sách đơn hàng:', error);
                setTableMessage(elements.tbody, 8, 'Không thể tải đơn hàng. Hãy kiểm tra đăng nhập và kết nối Supabase.', 'error');
                elements.count.textContent = 'Lỗi tải dữ liệu';
            } finally {
                if (requestId === state.requestId) elements.tbody.removeAttribute('aria-busy');
            }
        }

        const debouncedOrderSearch = debounce(() => loadOrders());
        elements.search.addEventListener('input', (event) => {
            state.search = event.target.value;
            state.page = 1;
            state.requestId += 1;
            debouncedOrderSearch();
        });
        elements.status.addEventListener('change', (event) => {
            state.status = event.target.value;
            state.page = 1;
            loadOrders();
        });
        elements.shipping.addEventListener('change', (event) => {
            state.shipping = event.target.value;
            state.page = 1;
            loadOrders();
        });

        await loadOrders();
    }

    async function init() {
        const page = document.body.dataset.adminPage;
        if (!['products', 'orders'].includes(page)) return;

        const client = window.supabaseClient;
        const tbody = document.getElementById(page === 'products' ? 'adminProductsBody' : 'adminOrdersBody');
        const count = document.getElementById(page === 'products' ? 'adminProductsCount' : 'adminOrdersCount');
        const columns = page === 'products' ? 7 : 8;

        if (!client) {
            if (tbody) setTableMessage(tbody, columns, 'Không tìm thấy kết nối Supabase.', 'error');
            if (count) count.textContent = 'Lỗi kết nối';
            return;
        }

        try {
            await requireAdmin(client);
            if (page === 'products') await initProductsPage(client);
            if (page === 'orders') await initOrdersPage(client);
        } catch (error) {
            console.error('Không thể khởi tạo danh sách quản trị:', error);
            if (tbody) setTableMessage(tbody, columns, error.message || 'Không có quyền truy cập.', 'error');
            if (count) count.textContent = 'Không thể tải dữ liệu';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
