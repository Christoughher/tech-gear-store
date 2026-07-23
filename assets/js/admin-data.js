(() => {
    'use strict';

    const STOCK_THRESHOLD = 50;
    const KPI_SELECTOR = '[data-kpi]';
    const numberFormatter = new Intl.NumberFormat('vi-VN');
    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });
    const compactCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        maximumFractionDigits: 1
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

    function formatNumber(value) {
        return numberFormatter.format(Number(value) || 0);
    }

    function formatCurrency(value) {
        return currencyFormatter.format(Number(value) || 0);
    }

    function setKpi(name, value) {
        const element = document.querySelector(`[data-kpi="${name}"]`);
        if (element) element.textContent = value;
    }

    function markKpisAsError(message) {
        document.querySelectorAll(KPI_SELECTOR).forEach((element) => {
            element.textContent = '—';
            element.title = message;
        });
    }

    async function requireAdmin(client) {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData?.session;
        if (!session?.user) {
            throw new Error('Bạn cần đăng nhập bằng tài khoản quản trị viên.');
        }

        const { data: profile, error: profileError } = await client
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profileError) throw profileError;
        if (profile?.role !== 'admin') {
            throw new Error('Tài khoản hiện tại không có quyền quản trị viên.');
        }
    }

    async function getKpis(client) {
        const { data, error } = await client.rpc('get_admin_dashboard_kpis');
        if (error) throw error;

        const kpis = Array.isArray(data) ? data[0] : data;
        if (!kpis) throw new Error('Database không trả về số liệu dashboard.');
        return kpis;
    }

    function renderSharedKpis(kpis) {
        setKpi('dashboard-revenue', formatCurrency(kpis.revenue_total));
        setKpi('dashboard-orders', formatNumber(kpis.order_total));
        setKpi('dashboard-customers', formatNumber(kpis.customer_total));
        setKpi('dashboard-products', formatNumber(kpis.product_total));

        setKpi('products-total', formatNumber(kpis.product_total));
        setKpi('products-in-stock', formatNumber(kpis.product_in_stock));
        setKpi('products-low-stock', formatNumber(kpis.product_low_stock));
        setKpi('products-out-of-stock', formatNumber(kpis.product_out_of_stock));

        setKpi('orders-total', formatNumber(kpis.order_total));
        setKpi('orders-completed', formatNumber(kpis.order_completed));
        setKpi('orders-pending', formatNumber(kpis.order_pending));
        setKpi('orders-processing', formatNumber(kpis.order_processing));
        setKpi('orders-cancelled', formatNumber(kpis.order_cancelled));
    }

    async function loadMonthlyChart(client) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas || typeof window.Chart === 'undefined') return;

        const { data, error } = await client.rpc('get_admin_monthly_metrics', {
            p_months: 6
        });
        if (error) throw error;

        const rows = data || [];
        const labels = rows.map((row) => {
            const [year, month] = String(row.month_start).split('-');
            return `Tháng ${Number(month)}/${year}`;
        });

        window.Chart.getChart(canvas)?.destroy();
        new window.Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: rows.map((row) => Number(row.revenue_total) || 0),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Số đơn hàng',
                        data: rows.map((row) => Number(row.order_total) || 0),
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        borderWidth: 3,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                if (context.dataset.yAxisID === 'y') {
                                    return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                                }
                                return `Số đơn hàng: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            callback(value) {
                                return compactCurrencyFormatter.format(Number(value) || 0);
                            }
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    async function loadCategoryChart(client) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas || typeof window.Chart === 'undefined') return;

        const { data, error } = await client.rpc('get_admin_category_sales');
        if (error) throw error;

        const rows = data || [];
        window.Chart.getChart(canvas)?.destroy();
        new window.Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: rows.map((row) => row.category_name),
                datasets: [{
                    label: 'Số lượng đã bán',
                    data: rows.map((row) => Number(row.quantity_sold) || 0),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return `${context.label}: ${formatNumber(context.parsed)} sản phẩm`;
                            }
                        }
                    }
                }
            }
        });
    }

    function createTextCell(value) {
        const cell = document.createElement('td');
        cell.textContent = value;
        return cell;
    }

    function renderRecentOrders(orders) {
        const body = document.getElementById('recentOrdersBody');
        if (!body) return;

        body.replaceChildren();
        if (!orders.length) {
            const row = document.createElement('tr');
            const cell = createTextCell('Chưa có đơn hàng.');
            cell.colSpan = 5;
            row.appendChild(cell);
            body.appendChild(row);
            return;
        }

        orders.forEach((order) => {
            const row = document.createElement('tr');
            const shortId = String(order.id || '').slice(0, 8).toUpperCase();
            const idCell = createTextCell(`#${shortId}`);
            idCell.title = String(order.id || '');

            row.appendChild(idCell);
            row.appendChild(createTextCell(formatCurrency(order.total_price)));
            row.appendChild(createTextCell(order.shipping_method || 'Tiêu chuẩn'));
            row.appendChild(createTextCell(
                order.created_at ? dateFormatter.format(new Date(order.created_at)) : '—'
            ));

            const statusCell = document.createElement('td');
            const status = orderStatusMeta[order.status] || {
                label: order.status || 'Không xác định',
                className: 'pending'
            };
            const badge = document.createElement('span');
            badge.className = `badge ${status.className}`;
            badge.textContent = status.label;
            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            body.appendChild(row);
        });
    }

    async function loadRecentOrders(client) {
        let { data, error } = await client
            .from('orders')
            .select('id, total_price, shipping_method, created_at, status')
            .order('created_at', { ascending: false })
            .limit(5);

        // Database cũ có thể chưa chạy add-shipping-method.sql.
        if (error?.code === '42703') {
            const fallback = await client
                .from('orders')
                .select('id, total_price, created_at, status')
                .order('created_at', { ascending: false })
                .limit(5);
            data = fallback.data;
            error = fallback.error;
        }

        if (error) throw error;
        renderRecentOrders(data || []);
    }

    function showRecentOrdersError(message) {
        const body = document.getElementById('recentOrdersBody');
        if (!body) return;
        body.replaceChildren();
        const row = document.createElement('tr');
        const cell = createTextCell('Không thể tải đơn hàng gần đây.');
        cell.colSpan = 5;
        cell.title = message;
        row.appendChild(cell);
        body.appendChild(row);
    }

    async function init() {
        const page = document.body.dataset.adminPage;
        if (!page || !document.querySelector(KPI_SELECTOR)) return;

        const client = window.supabaseClient;
        if (!client) {
            markKpisAsError('Không tìm thấy kết nối Supabase.');
            return;
        }

        try {
            await requireAdmin(client);
            const kpis = await getKpis(client);
            renderSharedKpis(kpis);

            if (page === 'overview') {
                const results = await Promise.allSettled([
                    loadMonthlyChart(client),
                    loadCategoryChart(client),
                    loadRecentOrders(client)
                ]);

                results.forEach((result, index) => {
                    if (result.status !== 'rejected') return;
                    const labels = ['biểu đồ doanh thu', 'biểu đồ danh mục', 'đơn hàng gần đây'];
                    console.error(`Không thể tải ${labels[index]}:`, result.reason);
                    if (index === 2) {
                        showRecentOrdersError(result.reason?.message || 'Lỗi không xác định');
                    }
                });
            }

            console.info(`Đã tải KPI admin từ Supabase với ngưỡng tồn kho ${STOCK_THRESHOLD}.`);
        } catch (error) {
            console.error('Không thể tải dữ liệu admin từ Supabase:', error);
            markKpisAsError(error.message || 'Lỗi không xác định');
            showRecentOrdersError(error.message || 'Lỗi không xác định');
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
