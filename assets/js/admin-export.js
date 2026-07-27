(() => {
    'use strict';

    const PAGE_SIZE = 500;
    const ID_FILTER_CHUNK_SIZE = 100;
    const MAX_ROWS_PER_TABLE = 100000;
    const MAX_RECONCILIATION_ATTEMPTS = 2;
    const MONEY_TOLERANCE = 0.01;
    const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const VND_NUMBER_FORMAT = '#,##0 "₫"';
    const DATE_NUMBER_FORMAT = 'dd/mm/yyyy hh:mm';
    const DATE_ONLY_NUMBER_FORMAT = 'dd/mm/yyyy';

    const COLORS = Object.freeze({
        navy: 'FF0F172A',
        blue: 'FF2563EB',
        blueLight: 'FFDBEAFE',
        green: 'FF15803D',
        greenLight: 'FFDCFCE7',
        amber: 'FFD97706',
        amberLight: 'FFFEF3C7',
        red: 'FFDC2626',
        redLight: 'FFFEE2E2',
        slate: 'FF475569',
        slateLight: 'FFF1F5F9',
        border: 'FFE2E8F0',
        white: 'FFFFFFFF'
    });

    const KPI_DEFINITIONS = Object.freeze([
        {
            key: 'revenue_total',
            label: 'Doanh thu đơn hoàn thành',
            definition: 'Tổng orders.total_price của đơn có status = completed.',
            format: 'currency'
        },
        {
            key: 'order_total',
            label: 'Tổng đơn hàng',
            definition: 'Tất cả đơn hàng, không phân biệt trạng thái.',
            format: 'number'
        },
        {
            key: 'customer_total',
            label: 'Khách hàng đã đặt hàng',
            definition: 'Số user_id khác nhau đã từng có đơn hàng.',
            format: 'number'
        },
        {
            key: 'product_total',
            label: 'Tổng sản phẩm',
            definition: 'Tất cả sản phẩm, gồm active, hidden và out_of_stock.',
            format: 'number'
        },
        {
            key: 'product_in_stock',
            label: 'Sản phẩm còn nhiều hàng',
            definition: 'Sản phẩm có stock > 50.',
            format: 'number'
        },
        {
            key: 'product_low_stock',
            label: 'Sản phẩm sắp hết',
            definition: 'Sản phẩm có stock từ 1 đến 50.',
            format: 'number'
        },
        {
            key: 'product_out_of_stock',
            label: 'Sản phẩm hết hàng',
            definition: 'Sản phẩm có stock = 0.',
            format: 'number'
        },
        {
            key: 'order_completed',
            label: 'Đơn hoàn thành',
            definition: 'Đơn có status = completed.',
            format: 'number'
        },
        {
            key: 'order_pending',
            label: 'Đơn chờ duyệt',
            definition: 'Đơn có status = pending.',
            format: 'number'
        },
        {
            key: 'order_processing',
            label: 'Đơn đang xử lý/giao',
            definition: 'Đơn có status = processing.',
            format: 'number'
        },
        {
            key: 'order_cancelled',
            label: 'Đơn đã hủy',
            definition: 'Đơn có status = cancelled.',
            format: 'number'
        }
    ]);

    const ORDER_STATUS_LABELS = Object.freeze({
        pending: 'Chờ duyệt',
        processing: 'Đang xử lý/giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    });

    const PRODUCT_STATUS_LABELS = Object.freeze({
        active: 'Đang bán',
        hidden: 'Đang ẩn',
        out_of_stock: 'Hết hàng'
    });

    const dashboardNumberFormatter = new Intl.NumberFormat('vi-VN');
    const dashboardCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });
    const monthKeyFormatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    const vietnamDatePartsFormatter = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Asia/Ho_Chi_Minh'
    });

    function toNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function sanitizeText(value) {
        const text = String(value ?? '').trim();
        return /^[=+\-@\t\r]/.test(text) ? `\u200B${text}` : text;
    }

    function toVietnamExcelDate(value) {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;

        const parts = Object.fromEntries(
            vietnamDatePartsFormatter
                .formatToParts(date)
                .filter((part) => part.type !== 'literal')
                .map((part) => [part.type, Number(part.value)])
        );

        return new Date(Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day,
            parts.hour,
            parts.minute,
            parts.second
        ));
    }

    function toDateOnly(value) {
        if (!value) return null;
        const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(Date.UTC(year, month - 1, day));
    }

    function getMonthKey(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const parts = monthKeyFormatter.formatToParts(date);
        const year = parts.find((part) => part.type === 'year')?.value;
        const month = parts.find((part) => part.type === 'month')?.value;
        return year && month ? `${year}-${month}` : '';
    }

    function normalizeRpcRow(data, errorMessage) {
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error(errorMessage);
        return row;
    }

    async function requireAuthenticatedAdmin(client) {
        const { data: userData, error: userError } = await client.auth.getUser();
        if (userError) throw userError;

        const user = userData?.user;
        if (!user) {
            const error = new Error('Bạn cần đăng nhập bằng tài khoản quản trị viên.');
            error.code = 'ADMIN_AUTH_REQUIRED';
            throw error;
        }

        const { data: profile, error: profileError } = await client
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) throw profileError;
        if (profile?.role !== 'admin') {
            const error = new Error('Tài khoản hiện tại không có quyền xuất báo cáo quản trị.');
            error.code = 'ADMIN_EXPORT_FORBIDDEN';
            throw error;
        }

        return user;
    }

    async function fetchAllRows(client, table, columns) {
        const rows = [];
        let lastId = null;

        while (true) {
            let query = client
                .from(table)
                .select(columns)
                .order('id', { ascending: true })
                .limit(PAGE_SIZE);
            if (lastId !== null) query = query.gt('id', lastId);
            const { data, error } = await query;

            if (error) {
                const wrappedError = new Error(`Không thể tải đầy đủ bảng ${table}: ${error.message}`);
                wrappedError.code = error.code;
                throw wrappedError;
            }

            const page = data || [];
            if (!page.length) break;
            if (rows.length + page.length > MAX_ROWS_PER_TABLE) {
                throw new Error(
                    `Bảng ${table} vượt quá ${dashboardNumberFormatter.format(MAX_ROWS_PER_TABLE)} dòng, `
                    + 'hãy xuất theo khoảng thời gian nhỏ hơn.'
                );
            }

            rows.push(...page);
            const nextLastId = page[page.length - 1]?.id;
            if (!nextLastId || nextLastId === lastId) {
                throw new Error(`Không thể tiếp tục phân trang bảng ${table} một cách an toàn.`);
            }
            lastId = nextLastId;
        }

        return rows;
    }

    async function fetchRowsByIds(client, table, columns, ids) {
        const uniqueIds = [...new Set(ids.filter(Boolean))].sort();
        const rows = [];

        for (let start = 0; start < uniqueIds.length; start += ID_FILTER_CHUNK_SIZE) {
            const idChunk = uniqueIds.slice(start, start + ID_FILTER_CHUNK_SIZE);
            let lastId = null;

            while (true) {
                let query = client
                    .from(table)
                    .select(columns)
                    .in('id', idChunk)
                    .order('id', { ascending: true })
                    .limit(PAGE_SIZE);
                if (lastId !== null) query = query.gt('id', lastId);
                const { data, error } = await query;

                if (error) {
                    const wrappedError = new Error(
                        `Không thể tải dữ liệu liên quan từ bảng ${table}: ${error.message}`
                    );
                    wrappedError.code = error.code;
                    throw wrappedError;
                }

                const page = data || [];
                if (!page.length) break;
                rows.push(...page);

                const nextLastId = page[page.length - 1]?.id;
                if (!nextLastId || nextLastId === lastId) {
                    throw new Error(`Không thể tiếp tục phân trang bảng ${table} một cách an toàn.`);
                }
                lastId = nextLastId;
            }
        }

        return rows;
    }

    async function getDashboardKpis(client) {
        const { data, error } = await client.rpc('get_admin_dashboard_kpis');
        if (error) throw error;
        return normalizeRpcRow(data, 'Database không trả về KPI dashboard.');
    }

    async function getMonthlyMetrics(client) {
        const { data, error } = await client.rpc('get_admin_monthly_metrics', {
            p_months: 6
        });
        if (error) throw error;
        return data || [];
    }

    async function getCategorySales(client) {
        const { data, error } = await client.rpc('get_admin_category_sales');
        if (error) throw error;
        return data || [];
    }

    function calculateKpis(orders, products) {
        const completedOrders = orders.filter((order) => order.status === 'completed');
        return {
            revenue_total: completedOrders.reduce(
                (sum, order) => sum + toNumber(order.total_price),
                0
            ),
            order_total: orders.length,
            customer_total: new Set(orders.map((order) => order.user_id).filter(Boolean)).size,
            product_total: products.length,
            product_in_stock: products.filter((product) => toNumber(product.stock) > 50).length,
            product_low_stock: products.filter((product) => {
                const stock = toNumber(product.stock);
                return stock >= 1 && stock <= 50;
            }).length,
            product_out_of_stock: products.filter((product) => toNumber(product.stock) === 0).length,
            order_completed: completedOrders.length,
            order_pending: orders.filter((order) => order.status === 'pending').length,
            order_processing: orders.filter((order) => order.status === 'processing').length,
            order_cancelled: orders.filter((order) => order.status === 'cancelled').length
        };
    }

    function calculateMonthlyMetrics(orders, rpcRows) {
        return rpcRows.map((rpcRow) => {
            const monthKey = String(rpcRow.month_start || '').slice(0, 7);
            const ordersInMonth = orders.filter((order) => getMonthKey(order.created_at) === monthKey);
            return {
                month_start: rpcRow.month_start,
                revenue_total: ordersInMonth
                    .filter((order) => order.status === 'completed')
                    .reduce((sum, order) => sum + toNumber(order.total_price), 0),
                order_total: ordersInMonth.length
            };
        });
    }

    function calculateCategorySales(orders, orderItems, products, rpcRows) {
        const completedOrderIds = new Set(
            orders
                .filter((order) => order.status === 'completed')
                .map((order) => order.id)
        );
        const productById = new Map(products.map((product) => [product.id, product]));
        const quantityByCategory = new Map();

        orderItems.forEach((item) => {
            if (!completedOrderIds.has(item.order_id)) return;
            const categoryId = productById.get(item.product_id)?.category_id;
            if (!categoryId) return;
            quantityByCategory.set(
                categoryId,
                (quantityByCategory.get(categoryId) || 0) + toNumber(item.quantity)
            );
        });

        return rpcRows.map((row) => ({
            category_id: row.category_id,
            category_name: row.category_name,
            quantity_sold: quantityByCategory.get(row.category_id) || 0
        }));
    }

    function calculateOrderIntegrity(orders, orderItems) {
        const itemsByOrder = new Map();
        orderItems.forEach((item) => {
            if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
            itemsByOrder.get(item.order_id).push(item);
        });

        const rows = orders.map((order) => {
            const items = itemsByOrder.get(order.id) || [];
            const snapshotTotal = items.reduce(
                (sum, item) => (
                    sum + (toNumber(item.quantity) * toNumber(item.price_at_purchase))
                ),
                0
            );
            const quantity = items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
            return {
                orderId: order.id,
                itemLines: items.length,
                quantity,
                snapshotTotal,
                difference: toNumber(order.total_price) - snapshotTotal
            };
        });

        return { itemsByOrder, rows };
    }

    function metricMatches(key, left, right) {
        const difference = Math.abs(toNumber(left) - toNumber(right));
        return key.includes('revenue') ? difference <= MONEY_TOLERANCE : difference === 0;
    }

    function kpisMatch(left, right) {
        return KPI_DEFINITIONS.every(({ key }) => metricMatches(key, left?.[key], right?.[key]));
    }

    function monthlyMetricsMatch(rpcRows, calculatedRows) {
        if (rpcRows.length !== calculatedRows.length) return false;
        return rpcRows.every((row, index) => (
            String(row.month_start) === String(calculatedRows[index]?.month_start)
            && metricMatches('revenue_total', row.revenue_total, calculatedRows[index]?.revenue_total)
            && metricMatches('order_total', row.order_total, calculatedRows[index]?.order_total)
        ));
    }

    function categorySalesMatch(rpcRows, calculatedRows, categories) {
        if (
            rpcRows.length !== calculatedRows.length
            || rpcRows.length !== categories.length
        ) return false;

        const calculatedById = new Map(
            calculatedRows.map((row) => [row.category_id, toNumber(row.quantity_sold)])
        );
        const categoryNameById = new Map(
            categories.map((category) => [category.id, String(category.name)])
        );

        return rpcRows.every((row) => (
            categoryNameById.has(row.category_id)
            && String(row.category_name) === categoryNameById.get(row.category_id)
            &&
            metricMatches(
                'quantity_sold',
                row.quantity_sold,
                calculatedById.get(row.category_id)
            )
        ));
    }

    async function fetchReportTables(client) {
        const [
            orders,
            orderItems,
            products,
            categories
        ] = await Promise.all([
            fetchAllRows(
                client,
                'orders',
                'id,user_id,receiver_name,receiver_phone,shipping_address,'
                + 'shipping_method,total_price,status,note,inventory_deducted_at,'
                + 'inventory_restored_at,cancelled_at,created_at,updated_at'
            ),
            fetchAllRows(
                client,
                'order_items',
                'id,order_id,product_id,product_name,product_sku,quantity,'
                + 'price_at_purchase,created_at'
            ),
            fetchAllRows(
                client,
                'products',
                'id,sku,name,category_id,brand,subcategory,price,original_price,'
                + 'discount_percent,stock,status,created_at,updated_at'
            ),
            fetchAllRows(
                client,
                'categories',
                'id,name'
            )
        ]);

        const orderedCustomerIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))];
        const users = await fetchRowsByIds(
            client,
            'users',
            'id,email,display_name,role,created_at',
            orderedCustomerIds
        );
        const loadedUserIds = new Set(users.map((user) => user.id));
        const missingCustomerProfiles = orderedCustomerIds.filter(
            (userId) => !loadedUserIds.has(userId)
        );
        if (missingCustomerProfiles.length) {
            const error = new Error(
                `Thiếu ${missingCustomerProfiles.length} hồ sơ khách hàng liên quan đến đơn hàng.`
            );
            error.code = 'ADMIN_EXPORT_INCOMPLETE_ROWS';
            throw error;
        }

        return { orders, orderItems, products, users, categories };
    }

    async function loadConsistentReportData(client) {
        let finalReason = 'Số liệu thay đổi trong lúc tải.';

        for (let attempt = 1; attempt <= MAX_RECONCILIATION_ATTEMPTS; attempt += 1) {
            const kpisBefore = await getDashboardKpis(client);
            const tables = await fetchReportTables(client);
            const [kpisAfter, monthlyMetrics, categorySales] = await Promise.all([
                getDashboardKpis(client),
                getMonthlyMetrics(client),
                getCategorySales(client)
            ]);

            const calculatedKpis = calculateKpis(tables.orders, tables.products);
            const calculatedMonthlyMetrics = calculateMonthlyMetrics(
                tables.orders,
                monthlyMetrics
            );
            const calculatedCategorySales = calculateCategorySales(
                tables.orders,
                tables.orderItems,
                tables.products,
                categorySales
            );
            const { rows: orderIntegrity } = calculateOrderIntegrity(
                tables.orders,
                tables.orderItems
            );
            const snapshotMismatchCount = orderIntegrity.filter(
                (row) => row.itemLines === 0 || Math.abs(row.difference) > MONEY_TOLERANCE
            ).length;

            const databaseStayedStable = kpisMatch(kpisBefore, kpisAfter);
            const kpisReconciled = kpisMatch(kpisAfter, calculatedKpis);
            const monthlyReconciled = monthlyMetricsMatch(
                monthlyMetrics,
                calculatedMonthlyMetrics
            );
            const categoriesReconciled = categorySalesMatch(
                categorySales,
                calculatedCategorySales,
                tables.categories
            );

            if (
                databaseStayedStable
                && kpisReconciled
                && monthlyReconciled
                && categoriesReconciled
            ) {
                return {
                    ...tables,
                    kpis: kpisAfter,
                    calculatedKpis,
                    monthlyMetrics,
                    calculatedMonthlyMetrics,
                    categorySales,
                    calculatedCategorySales,
                    snapshotMismatchCount,
                    exportedAt: new Date(),
                    attempt
                };
            }

            const failedChecks = [];
            if (!databaseStayedStable) failedChecks.push('database vừa thay đổi');
            if (!kpisReconciled) failedChecks.push('KPI tổng quan');
            if (!monthlyReconciled) failedChecks.push('doanh thu theo tháng');
            if (!categoriesReconciled) failedChecks.push('doanh số danh mục');
            finalReason = `Không khớp: ${failedChecks.join(', ')}.`;
        }

        const error = new Error(
            `Không thể tạo báo cáo vì chưa đối chiếu được dữ liệu. ${finalReason} `
            + 'Vui lòng thử lại sau khi các thao tác cập nhật đơn hàng hoàn tất.'
        );
        error.code = 'ADMIN_EXPORT_RECONCILIATION_FAILED';
        throw error;
    }

    function buildDerivedData(report) {
        const userById = new Map(report.users.map((user) => [user.id, user]));
        const productById = new Map(report.products.map((product) => [product.id, product]));
        const categoryById = new Map(
            report.categories.map((category) => [category.id, category.name])
        );
        const orderById = new Map(report.orders.map((order) => [order.id, order]));
        const {
            itemsByOrder,
            rows: orderIntegrity
        } = calculateOrderIntegrity(report.orders, report.orderItems);

        const completedOrderIds = new Set(
            report.orders
                .filter((order) => order.status === 'completed')
                .map((order) => order.id)
        );
        const productSales = new Map();

        report.orderItems.forEach((item) => {
            if (!completedOrderIds.has(item.order_id)) return;
            const current = productSales.get(item.product_id) || { quantity: 0, revenue: 0 };
            current.quantity += toNumber(item.quantity);
            current.revenue += toNumber(item.quantity) * toNumber(item.price_at_purchase);
            productSales.set(item.product_id, current);
        });

        const customerMetrics = new Map();
        report.orders.forEach((order) => {
            const current = customerMetrics.get(order.user_id) || {
                orderTotal: 0,
                completedTotal: 0,
                cancelledTotal: 0,
                completedRevenue: 0
            };
            current.orderTotal += 1;
            if (order.status === 'completed') {
                current.completedTotal += 1;
                current.completedRevenue += toNumber(order.total_price);
            }
            if (order.status === 'cancelled') current.cancelledTotal += 1;
            customerMetrics.set(order.user_id, current);
        });

        const orderIntegrityById = new Map(
            orderIntegrity.map((row) => [row.orderId, row])
        );

        return {
            userById,
            productById,
            categoryById,
            orderById,
            itemsByOrder,
            productSales,
            customerMetrics,
            orderIntegrity,
            orderIntegrityById
        };
    }

    function columnLetter(columnNumber) {
        let number = columnNumber;
        let letters = '';
        while (number > 0) {
            const remainder = (number - 1) % 26;
            letters = String.fromCharCode(65 + remainder) + letters;
            number = Math.floor((number - 1) / 26);
        }
        return letters;
    }

    function applyDataSheetStyle(worksheet, columns, rowCount) {
        worksheet.views = [{
            state: 'frozen',
            ySplit: 1,
            showGridLines: false
        }];
        worksheet.properties.defaultRowHeight = 20;
        worksheet.pageSetup = {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2
            }
        };

        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: COLORS.navy }
            };
            cell.font = {
                name: 'Aptos',
                size: 11,
                bold: true,
                color: { argb: COLORS.white }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };
            cell.border = {
                bottom: { style: 'medium', color: { argb: COLORS.blue } }
            };
        });

        columns.forEach((column, index) => {
            const excelColumn = worksheet.getColumn(index + 1);
            excelColumn.width = column.width || 16;
            if (column.numFmt) excelColumn.numFmt = column.numFmt;
            excelColumn.alignment = {
                vertical: 'top',
                horizontal: column.align || 'left',
                wrapText: Boolean(column.wrap)
            };
        });

        for (let rowNumber = 2; rowNumber <= rowCount + 1; rowNumber += 1) {
            const row = worksheet.getRow(rowNumber);
            if (rowNumber % 2 === 1) {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' }
                    };
                });
            }
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.font = { name: 'Aptos', size: 10, color: { argb: COLORS.navy } };
                cell.border = {
                    bottom: { style: 'hair', color: { argb: COLORS.border } }
                };
            });
        }

        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: columns.length }
        };
        worksheet.getRow(1).commit?.();
    }

    function styleStatusCell(cell, status) {
        const styles = {
            completed: { fill: COLORS.greenLight, font: COLORS.green },
            pending: { fill: COLORS.amberLight, font: COLORS.amber },
            processing: { fill: COLORS.blueLight, font: COLORS.blue },
            cancelled: { fill: COLORS.redLight, font: COLORS.red },
            active: { fill: COLORS.greenLight, font: COLORS.green },
            hidden: { fill: COLORS.slateLight, font: COLORS.slate },
            out_of_stock: { fill: COLORS.redLight, font: COLORS.red }
        };
        const style = styles[status];
        if (!style) return;
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: style.fill }
        };
        cell.font = {
            name: 'Aptos',
            size: 10,
            bold: true,
            color: { argb: style.font }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    function populateDetailSheet(worksheet, report, derived) {
        const columns = [
            { header: 'Mã chi tiết', key: 'id', width: 38, numFmt: '@' },
            { header: 'Mã đơn hàng', key: 'order_id', width: 38, numFmt: '@' },
            { header: 'Ngày đặt', key: 'order_date', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Trạng thái đơn', key: 'order_status', width: 18 },
            { header: 'SKU snapshot', key: 'product_sku', width: 28, numFmt: '@' },
            { header: 'Tên sản phẩm snapshot', key: 'product_name', width: 46, wrap: true },
            { header: 'Số lượng', key: 'quantity', width: 12, numFmt: '#,##0', align: 'right' },
            { header: 'Giá lúc mua', key: 'unit_price', width: 18, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Thành tiền', key: 'line_total', width: 19, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Mã sản phẩm', key: 'product_id', width: 38, numFmt: '@' },
            { header: 'Danh mục hiện tại', key: 'category', width: 20 },
            { header: 'Thương hiệu hiện tại', key: 'brand', width: 20 },
            { header: 'Ngày lưu snapshot', key: 'snapshot_date', width: 19, numFmt: DATE_NUMBER_FORMAT }
        ];
        worksheet.columns = columns;

        const rows = report.orderItems.map((item, index) => {
            const order = derived.orderById.get(item.order_id);
            const product = derived.productById.get(item.product_id);
            const lineTotal = toNumber(item.quantity) * toNumber(item.price_at_purchase);
            const excelRow = index + 2;

            return {
                id: sanitizeText(item.id),
                order_id: sanitizeText(item.order_id),
                order_date: toVietnamExcelDate(order?.created_at),
                order_status: sanitizeText(ORDER_STATUS_LABELS[order?.status] || order?.status),
                product_sku: sanitizeText(item.product_sku || ''),
                product_name: sanitizeText(item.product_name),
                quantity: toNumber(item.quantity),
                unit_price: toNumber(item.price_at_purchase),
                line_total: {
                    formula: `G${excelRow}*H${excelRow}`,
                    result: lineTotal
                },
                product_id: sanitizeText(item.product_id),
                category: sanitizeText(
                    derived.categoryById.get(product?.category_id) || product?.category_id || ''
                ),
                brand: sanitizeText(product?.brand || ''),
                snapshot_date: toVietnamExcelDate(item.created_at)
            };
        });

        worksheet.addRows(rows);
        applyDataSheetStyle(worksheet, columns, rows.length);
        rows.forEach((row, index) => {
            const status = derived.orderById.get(report.orderItems[index]?.order_id)?.status;
            styleStatusCell(worksheet.getCell(index + 2, 4), status);
        });
        return Math.max(2, rows.length + 1);
    }

    function populateOrdersSheet(worksheet, report, derived, detailLastRow) {
        const columns = [
            { header: 'Mã đơn hàng', key: 'id', width: 38, numFmt: '@' },
            { header: 'Ngày đặt', key: 'created_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Cập nhật lần cuối', key: 'updated_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Mã khách hàng', key: 'user_id', width: 38, numFmt: '@' },
            { header: 'Tên tài khoản hiện tại', key: 'display_name', width: 24 },
            { header: 'Email tài khoản hiện tại', key: 'email', width: 30 },
            { header: 'Người nhận', key: 'receiver_name', width: 24 },
            { header: 'Số điện thoại nhận', key: 'receiver_phone', width: 19, numFmt: '@' },
            { header: 'Địa chỉ giao hàng', key: 'shipping_address', width: 44, wrap: true },
            { header: 'Hình thức giao', key: 'shipping_method', width: 18 },
            { header: 'Mã trạng thái', key: 'status_code', width: 16 },
            { header: 'Trạng thái', key: 'status_label', width: 20 },
            { header: 'Tổng tiền sản phẩm', key: 'total_price', width: 21, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Số dòng sản phẩm', key: 'item_lines', width: 16, numFmt: '#,##0', align: 'right' },
            { header: 'Tổng số lượng', key: 'quantity', width: 15, numFmt: '#,##0', align: 'right' },
            { header: 'Tổng snapshot', key: 'snapshot_total', width: 19, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Chênh lệch', key: 'difference', width: 17, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Ghi chú', key: 'note', width: 36, wrap: true },
            { header: 'Ngày hủy', key: 'cancelled_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Thời điểm trừ kho', key: 'inventory_deducted_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Thời điểm hoàn kho', key: 'inventory_restored_at', width: 19, numFmt: DATE_NUMBER_FORMAT }
        ];
        worksheet.columns = columns;

        const rows = report.orders.map((order, index) => {
            const user = derived.userById.get(order.user_id);
            const integrity = derived.orderIntegrityById.get(order.id);
            const excelRow = index + 2;

            return {
                id: sanitizeText(order.id),
                created_at: toVietnamExcelDate(order.created_at),
                updated_at: toVietnamExcelDate(order.updated_at),
                user_id: sanitizeText(order.user_id),
                display_name: sanitizeText(user?.display_name || ''),
                email: sanitizeText(user?.email || ''),
                receiver_name: sanitizeText(order.receiver_name || ''),
                receiver_phone: sanitizeText(order.receiver_phone || ''),
                shipping_address: sanitizeText(order.shipping_address),
                shipping_method: sanitizeText(order.shipping_method || 'Tiêu chuẩn'),
                status_code: sanitizeText(order.status),
                status_label: sanitizeText(ORDER_STATUS_LABELS[order.status] || order.status),
                total_price: toNumber(order.total_price),
                item_lines: {
                    formula: `COUNTIF('Chi tiết đơn'!$B$2:$B$${detailLastRow},A${excelRow})`,
                    result: integrity?.itemLines || 0
                },
                quantity: {
                    formula: `SUMIF('Chi tiết đơn'!$B$2:$B$${detailLastRow},A${excelRow},'Chi tiết đơn'!$G$2:$G$${detailLastRow})`,
                    result: integrity?.quantity || 0
                },
                snapshot_total: {
                    formula: `SUMIF('Chi tiết đơn'!$B$2:$B$${detailLastRow},A${excelRow},'Chi tiết đơn'!$I$2:$I$${detailLastRow})`,
                    result: integrity?.snapshotTotal || 0
                },
                difference: {
                    formula: `M${excelRow}-P${excelRow}`,
                    result: integrity?.difference || 0
                },
                note: order.note ? sanitizeText(order.note) : null,
                cancelled_at: toVietnamExcelDate(order.cancelled_at),
                inventory_deducted_at: toVietnamExcelDate(order.inventory_deducted_at),
                inventory_restored_at: toVietnamExcelDate(order.inventory_restored_at)
            };
        });

        worksheet.addRows(rows);
        applyDataSheetStyle(worksheet, columns, rows.length);
        report.orders.forEach((order, index) => {
            styleStatusCell(worksheet.getCell(index + 2, 12), order.status);
            const differenceCell = worksheet.getCell(index + 2, 17);
            if (Math.abs(derived.orderIntegrityById.get(order.id)?.difference || 0) > MONEY_TOLERANCE) {
                differenceCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: COLORS.redLight }
                };
                differenceCell.font = { bold: true, color: { argb: COLORS.red } };
            }
        });
        return Math.max(2, rows.length + 1);
    }

    function populateProductsSheet(worksheet, report, derived) {
        const columns = [
            { header: 'SKU', key: 'sku', width: 30, numFmt: '@' },
            { header: 'Tên sản phẩm', key: 'name', width: 46, wrap: true },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Thương hiệu', key: 'brand', width: 20 },
            { header: 'Loại sản phẩm', key: 'subcategory', width: 20 },
            { header: 'Giá hiện tại', key: 'price', width: 18, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Giá gốc hiện tại', key: 'original_price', width: 18, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Giảm giá', key: 'discount_percent', width: 12, numFmt: '0%', align: 'right' },
            { header: 'Tồn kho', key: 'stock', width: 12, numFmt: '#,##0', align: 'right' },
            { header: 'Trạng thái', key: 'status_label', width: 16 },
            { header: 'SL bán - đơn hoàn thành', key: 'sold_quantity', width: 20, numFmt: '#,##0', align: 'right' },
            { header: 'Doanh thu hoàn thành', key: 'completed_revenue', width: 21, numFmt: VND_NUMBER_FORMAT, align: 'right' },
            { header: 'Ngày tạo', key: 'created_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Cập nhật lần cuối', key: 'updated_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Mã sản phẩm', key: 'id', width: 38, numFmt: '@' }
        ];
        worksheet.columns = columns;

        const rows = report.products.map((product) => {
            const sales = derived.productSales.get(product.id) || { quantity: 0, revenue: 0 };
            return {
                sku: sanitizeText(product.sku),
                name: sanitizeText(product.name),
                category: sanitizeText(
                    derived.categoryById.get(product.category_id) || product.category_id
                ),
                brand: sanitizeText(product.brand || ''),
                subcategory: sanitizeText(product.subcategory || ''),
                price: toNumber(product.price),
                original_price: product.original_price == null
                    ? null
                    : toNumber(product.original_price),
                discount_percent: toNumber(product.discount_percent) / 100,
                stock: toNumber(product.stock),
                status_label: sanitizeText(PRODUCT_STATUS_LABELS[product.status] || product.status),
                sold_quantity: sales.quantity,
                completed_revenue: sales.revenue,
                created_at: toVietnamExcelDate(product.created_at),
                updated_at: toVietnamExcelDate(product.updated_at),
                id: sanitizeText(product.id)
            };
        });

        worksheet.addRows(rows);
        applyDataSheetStyle(worksheet, columns, rows.length);
        report.products.forEach((product, index) => {
            styleStatusCell(worksheet.getCell(index + 2, 10), product.status);
            const stockCell = worksheet.getCell(index + 2, 9);
            const stock = toNumber(product.stock);
            if (stock === 0) {
                stockCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.redLight } };
                stockCell.font = { bold: true, color: { argb: COLORS.red } };
            } else if (stock <= 50) {
                stockCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberLight } };
                stockCell.font = { bold: true, color: { argb: COLORS.amber } };
            }
        });
        return Math.max(2, rows.length + 1);
    }

    function populateCustomersSheet(worksheet, report, derived) {
        const columns = [
            { header: 'Mã khách hàng', key: 'id', width: 38, numFmt: '@' },
            { header: 'Tên tài khoản hiện tại', key: 'display_name', width: 26 },
            { header: 'Email tài khoản hiện tại', key: 'email', width: 32 },
            { header: 'Role hiện tại', key: 'role', width: 14 },
            { header: 'Ngày đăng ký', key: 'created_at', width: 19, numFmt: DATE_NUMBER_FORMAT },
            { header: 'Tổng đơn', key: 'order_total', width: 13, numFmt: '#,##0', align: 'right' },
            { header: 'Đơn hoàn thành', key: 'completed_total', width: 16, numFmt: '#,##0', align: 'right' },
            { header: 'Đơn đã hủy', key: 'cancelled_total', width: 14, numFmt: '#,##0', align: 'right' },
            { header: 'Chi tiêu đơn hoàn thành', key: 'completed_revenue', width: 23, numFmt: VND_NUMBER_FORMAT, align: 'right' }
        ];
        worksheet.columns = columns;

        const rows = [...derived.customerMetrics.entries()]
            .map(([userId, metrics]) => {
                const user = derived.userById.get(userId);
                return {
                    id: sanitizeText(userId),
                    display_name: sanitizeText(user?.display_name || ''),
                    email: sanitizeText(user?.email || ''),
                    role: sanitizeText(user?.role || ''),
                    created_at: toVietnamExcelDate(user?.created_at),
                    order_total: metrics.orderTotal,
                    completed_total: metrics.completedTotal,
                    cancelled_total: metrics.cancelledTotal,
                    completed_revenue: metrics.completedRevenue
                };
            })
            .sort((left, right) => (
                right.completed_revenue - left.completed_revenue
                || String(left.email).localeCompare(String(right.email), 'vi')
            ));

        worksheet.addRows(rows);
        applyDataSheetStyle(worksheet, columns, rows.length);
        return Math.max(2, rows.length + 1);
    }

    function buildReconciliationRows(report) {
        const rows = [];

        KPI_DEFINITIONS.forEach((metric) => {
            const rpcValue = toNumber(report.kpis[metric.key]);
            const calculatedValue = toNumber(report.calculatedKpis[metric.key]);
            rows.push({
                group: 'KPI tổng quan',
                metric: metric.label,
                rpc_value: rpcValue,
                calculated_value: calculatedValue,
                difference: calculatedValue - rpcValue,
                result: metricMatches(metric.key, rpcValue, calculatedValue) ? 'Khớp' : 'Không khớp',
                note: metric.definition,
                format: metric.format
            });
        });

        report.monthlyMetrics.forEach((row, index) => {
            const calculated = report.calculatedMonthlyMetrics[index];
            rows.push({
                group: 'Doanh thu tháng',
                metric: `Doanh thu ${String(row.month_start).slice(0, 7)}`,
                rpc_value: toNumber(row.revenue_total),
                calculated_value: toNumber(calculated?.revenue_total),
                difference: toNumber(calculated?.revenue_total) - toNumber(row.revenue_total),
                result: metricMatches(
                    'revenue_total',
                    row.revenue_total,
                    calculated?.revenue_total
                ) ? 'Khớp' : 'Không khớp',
                note: 'Doanh thu chỉ gồm đơn completed trong tháng theo múi giờ Asia/Ho_Chi_Minh.',
                format: 'currency'
            });
            rows.push({
                group: 'Đơn hàng tháng',
                metric: `Số đơn ${String(row.month_start).slice(0, 7)}`,
                rpc_value: toNumber(row.order_total),
                calculated_value: toNumber(calculated?.order_total),
                difference: toNumber(calculated?.order_total) - toNumber(row.order_total),
                result: metricMatches('order_total', row.order_total, calculated?.order_total)
                    ? 'Khớp'
                    : 'Không khớp',
                note: 'Số đơn gồm mọi trạng thái trong tháng.',
                format: 'number'
            });
        });

        const calculatedCategoryById = new Map(
            report.calculatedCategorySales.map((row) => [row.category_id, row])
        );
        report.categorySales.forEach((row) => {
            const calculated = calculatedCategoryById.get(row.category_id);
            rows.push({
                group: 'Doanh số danh mục',
                metric: sanitizeText(row.category_name),
                rpc_value: toNumber(row.quantity_sold),
                calculated_value: toNumber(calculated?.quantity_sold),
                difference: toNumber(calculated?.quantity_sold) - toNumber(row.quantity_sold),
                result: metricMatches(
                    'quantity_sold',
                    row.quantity_sold,
                    calculated?.quantity_sold
                ) ? 'Khớp' : 'Không khớp',
                note: 'Số lượng snapshot trong đơn completed, theo danh mục hiện tại của sản phẩm.',
                format: 'number'
            });
        });

        return rows;
    }

    function populateReconciliationSheet(worksheet, report, derived) {
        const columns = [
            { header: 'Nhóm kiểm tra', key: 'group', width: 22 },
            { header: 'Chỉ tiêu', key: 'metric', width: 32 },
            { header: 'Database / RPC', key: 'rpc_value', width: 18, align: 'right' },
            { header: 'Tính từ dữ liệu xuất', key: 'calculated_value', width: 20, align: 'right' },
            { header: 'Chênh lệch', key: 'difference', width: 16, align: 'right' },
            { header: 'Kết quả', key: 'result', width: 14, align: 'center' },
            { header: 'Định nghĩa / ghi chú', key: 'note', width: 62, wrap: true }
        ];
        worksheet.columns = columns;
        const rows = buildReconciliationRows(report);
        worksheet.addRows(rows);
        applyDataSheetStyle(worksheet, columns, rows.length);

        rows.forEach((row, index) => {
            const excelRow = index + 2;
            if (row.format === 'currency') {
                worksheet.getCell(excelRow, 3).numFmt = VND_NUMBER_FORMAT;
                worksheet.getCell(excelRow, 4).numFmt = VND_NUMBER_FORMAT;
                worksheet.getCell(excelRow, 5).numFmt = VND_NUMBER_FORMAT;
            } else {
                worksheet.getCell(excelRow, 3).numFmt = '#,##0';
                worksheet.getCell(excelRow, 4).numFmt = '#,##0';
                worksheet.getCell(excelRow, 5).numFmt = '#,##0';
            }
            const resultCell = worksheet.getCell(excelRow, 6);
            const matched = row.result === 'Khớp';
            resultCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: matched ? COLORS.greenLight : COLORS.redLight }
            };
            resultCell.font = {
                bold: true,
                color: { argb: matched ? COLORS.green : COLORS.red }
            };
        });

        const integrityMismatches = derived.orderIntegrity.filter(
            (row) => (
                row.itemLines === 0
                || Math.abs(row.difference) > MONEY_TOLERANCE
            )
        );
        const sectionRow = rows.length + 4;
        worksheet.mergeCells(sectionRow, 1, sectionRow, 7);
        const sectionCell = worksheet.getCell(sectionRow, 1);
        sectionCell.value = 'KIỂM TRA SNAPSHOT CHI TIẾT ĐƠN HÀNG';
        sectionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blueLight } };
        sectionCell.font = { bold: true, color: { argb: COLORS.blue } };
        sectionCell.alignment = { vertical: 'middle' };

        const integrityHeaderRow = sectionRow + 1;
        const integrityHeaders = [
            'Mã đơn hàng',
            'Số dòng SP',
            'Tổng số lượng',
            'Tổng tiền đơn',
            'Tổng snapshot',
            'Chênh lệch',
            'Kết quả'
        ];
        integrityHeaders.forEach((header, index) => {
            const cell = worksheet.getCell(integrityHeaderRow, index + 1);
            cell.value = header;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
            cell.font = { bold: true, color: { argb: COLORS.white } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });

        if (!integrityMismatches.length) {
            worksheet.mergeCells(integrityHeaderRow + 1, 1, integrityHeaderRow + 1, 7);
            const okCell = worksheet.getCell(integrityHeaderRow + 1, 1);
            okCell.value = 'Không phát hiện đơn thiếu chi tiết hoặc chênh lệch tổng snapshot.';
            okCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
            okCell.font = { bold: true, color: { argb: COLORS.green } };
        } else {
            integrityMismatches.forEach((row, index) => {
                const order = derived.orderById.get(row.orderId);
                const excelRow = integrityHeaderRow + 1 + index;
                const values = [
                    sanitizeText(row.orderId),
                    row.itemLines,
                    row.quantity,
                    toNumber(order?.total_price),
                    row.snapshotTotal,
                    row.difference,
                    row.itemLines === 0 ? 'Thiếu chi tiết' : 'Không khớp'
                ];
                values.forEach((value, columnIndex) => {
                    worksheet.getCell(excelRow, columnIndex + 1).value = value;
                });
                worksheet.getCell(excelRow, 4).numFmt = VND_NUMBER_FORMAT;
                worksheet.getCell(excelRow, 5).numFmt = VND_NUMBER_FORMAT;
                worksheet.getCell(excelRow, 6).numFmt = VND_NUMBER_FORMAT;
                worksheet.getCell(excelRow, 7).font = { bold: true, color: { argb: COLORS.red } };
                worksheet.getCell(excelRow, 7).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: COLORS.redLight }
                };
            });
        }
    }

    function populateSummarySheet(
        worksheet,
        report,
        orderLastRow,
        productLastRow,
        customerLastRow
    ) {
        worksheet.views = [{
            state: 'frozen',
            ySplit: 6,
            showGridLines: false
        }];
        worksheet.properties.defaultRowHeight = 21;
        worksheet.pageSetup = {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 1
        };
        [34, 21, 21, 16, 16, 19, 19, 28].forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });

        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = 'TECH.NO — BÁO CÁO QUẢN TRỊ';
        worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.navy }
        };
        worksheet.getCell('A1').font = {
            name: 'Aptos Display',
            size: 20,
            bold: true,
            color: { argb: COLORS.white }
        };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getRow(1).height = 40;

        worksheet.mergeCells('A2:H2');
        worksheet.getCell('A2').value = (
            'Dữ liệu được tải trực tiếp từ Supabase bằng phiên đăng nhập admin và '
            + 'đã đối chiếu với các RPC của dashboard trước khi xuất.'
        );
        worksheet.getCell('A2').font = { italic: true, color: { argb: COLORS.slate } };
        worksheet.getCell('A2').alignment = { wrapText: true, vertical: 'middle' };
        worksheet.getRow(2).height = 32;

        worksheet.getCell('A4').value = 'Nguồn dữ liệu';
        worksheet.getCell('B4').value = 'Supabase — TECH.NO';
        worksheet.getCell('A5').value = 'Thời điểm xuất';
        worksheet.getCell('B5').value = toVietnamExcelDate(report.exportedAt);
        worksheet.getCell('B5').numFmt = DATE_NUMBER_FORMAT;
        worksheet.getCell('D4').value = 'Phạm vi';
        worksheet.getCell('E4').value = 'Toàn bộ dữ liệu hiện có';
        worksheet.getCell('D5').value = 'Đối chiếu';
        const snapshotMismatchCount = Number.isFinite(report.snapshotMismatchCount)
            ? report.snapshotMismatchCount
            : derived.orderIntegrity.filter(
                (row) => row.itemLines === 0 || Math.abs(row.difference) > MONEY_TOLERANCE
            ).length;
        worksheet.getCell('E5').value = snapshotMismatchCount
            ? `KPI/RPC khớp · Snapshot: ${snapshotMismatchCount} cảnh báo`
            : `KPI/RPC và snapshot khớp sau ${report.attempt} lần tải`;
        ['A4', 'A5', 'D4', 'D5'].forEach((address) => {
            worksheet.getCell(address).font = { bold: true, color: { argb: COLORS.slate } };
        });
        worksheet.getCell('E5').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: snapshotMismatchCount ? COLORS.amberLight : COLORS.greenLight }
        };
        worksheet.getCell('E5').font = {
            bold: true,
            color: { argb: snapshotMismatchCount ? COLORS.amber : COLORS.green }
        };
        worksheet.getCell('E5').alignment = { wrapText: true, vertical: 'middle' };

        const headerRow = 7;
        ['Chỉ số', 'Theo Dashboard RPC', 'Tính từ dữ liệu xuất', 'Chênh lệch', 'Kết quả']
            .forEach((header, index) => {
                const cell = worksheet.getCell(headerRow, index + 1);
                cell.value = header;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
                cell.font = { bold: true, color: { argb: COLORS.white } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });

        const localFormulaByKey = {
            revenue_total: `SUMIF('Đơn hàng'!$K$2:$K$${orderLastRow},"completed",'Đơn hàng'!$M$2:$M$${orderLastRow})`,
            order_total: `COUNTA('Đơn hàng'!$A$2:$A$${orderLastRow})`,
            customer_total: `COUNTA('Khách hàng đặt hàng'!$A$2:$A$${customerLastRow})`,
            product_total: `COUNTA('Sản phẩm - Tồn kho'!$A$2:$A$${productLastRow})`,
            product_in_stock: `COUNTIF('Sản phẩm - Tồn kho'!$I$2:$I$${productLastRow},">50")`,
            product_low_stock: `COUNTIFS('Sản phẩm - Tồn kho'!$I$2:$I$${productLastRow},">=1",'Sản phẩm - Tồn kho'!$I$2:$I$${productLastRow},"<=50")`,
            product_out_of_stock: `COUNTIF('Sản phẩm - Tồn kho'!$I$2:$I$${productLastRow},0)`,
            order_completed: `COUNTIF('Đơn hàng'!$K$2:$K$${orderLastRow},"completed")`,
            order_pending: `COUNTIF('Đơn hàng'!$K$2:$K$${orderLastRow},"pending")`,
            order_processing: `COUNTIF('Đơn hàng'!$K$2:$K$${orderLastRow},"processing")`,
            order_cancelled: `COUNTIF('Đơn hàng'!$K$2:$K$${orderLastRow},"cancelled")`
        };

        KPI_DEFINITIONS.forEach((metric, index) => {
            const row = headerRow + 1 + index;
            const rpcValue = toNumber(report.kpis[metric.key]);
            const calculatedValue = toNumber(report.calculatedKpis[metric.key]);
            const difference = calculatedValue - rpcValue;

            worksheet.getCell(row, 1).value = metric.label;
            worksheet.getCell(row, 2).value = rpcValue;
            worksheet.getCell(row, 3).value = {
                formula: localFormulaByKey[metric.key],
                result: calculatedValue
            };
            worksheet.getCell(row, 4).value = {
                formula: `C${row}-B${row}`,
                result: difference
            };
            worksheet.getCell(row, 5).value = {
                formula: `IF(ABS(D${row})<=0.01,"Khớp","Không khớp")`,
                result: metricMatches(metric.key, rpcValue, calculatedValue)
                    ? 'Khớp'
                    : 'Không khớp'
            };

            const numFmt = metric.format === 'currency' ? VND_NUMBER_FORMAT : '#,##0';
            [2, 3, 4].forEach((column) => {
                worksheet.getCell(row, column).numFmt = numFmt;
                worksheet.getCell(row, column).alignment = { horizontal: 'right' };
            });
            worksheet.getCell(row, 5).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: COLORS.greenLight }
            };
            worksheet.getCell(row, 5).font = { bold: true, color: { argb: COLORS.green } };
            worksheet.getCell(row, 5).alignment = { horizontal: 'center' };
        });

        const completedOrders = toNumber(report.kpis.order_completed);
        const averageCompletedOrder = completedOrders
            ? toNumber(report.kpis.revenue_total) / completedOrders
            : 0;
        worksheet.getCell('G4').value = 'GIÁ TRỊ ĐƠN HOÀN THÀNH TB';
        worksheet.getCell('G4').font = { bold: true, color: { argb: COLORS.slate } };
        worksheet.getCell('G5').value = averageCompletedOrder;
        worksheet.getCell('G5').numFmt = VND_NUMBER_FORMAT;
        worksheet.getCell('G5').font = { size: 16, bold: true, color: { argb: COLORS.blue } };

        const analysisHeaderRow = 21;
        ['Tháng', 'Doanh thu completed', 'Tổng số đơn']
            .forEach((header, index) => {
                const cell = worksheet.getCell(analysisHeaderRow, index + 1);
                cell.value = header;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blue } };
                cell.font = { bold: true, color: { argb: COLORS.white } };
                cell.alignment = { horizontal: 'center' };
            });
        report.monthlyMetrics.forEach((row, index) => {
            const excelRow = analysisHeaderRow + 1 + index;
            worksheet.getCell(excelRow, 1).value = toDateOnly(row.month_start);
            worksheet.getCell(excelRow, 1).numFmt = 'mm/yyyy';
            worksheet.getCell(excelRow, 2).value = toNumber(row.revenue_total);
            worksheet.getCell(excelRow, 2).numFmt = VND_NUMBER_FORMAT;
            worksheet.getCell(excelRow, 3).value = toNumber(row.order_total);
            worksheet.getCell(excelRow, 3).numFmt = '#,##0';
        });

        ['Danh mục', 'SL bán completed', 'Tỷ trọng']
            .forEach((header, index) => {
                const cell = worksheet.getCell(analysisHeaderRow, index + 5);
                cell.value = header;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blue } };
                cell.font = { bold: true, color: { argb: COLORS.white } };
                cell.alignment = { horizontal: 'center' };
            });
        const categoryTotal = report.categorySales.reduce(
            (sum, row) => sum + toNumber(row.quantity_sold),
            0
        );
        report.categorySales.forEach((row, index) => {
            const excelRow = analysisHeaderRow + 1 + index;
            worksheet.getCell(excelRow, 5).value = sanitizeText(row.category_name);
            worksheet.getCell(excelRow, 6).value = toNumber(row.quantity_sold);
            worksheet.getCell(excelRow, 6).numFmt = '#,##0';
            worksheet.getCell(excelRow, 7).value = categoryTotal
                ? toNumber(row.quantity_sold) / categoryTotal
                : 0;
            worksheet.getCell(excelRow, 7).numFmt = '0.0%';
        });

        const noteRow = Math.max(
            analysisHeaderRow + report.monthlyMetrics.length,
            analysisHeaderRow + report.categorySales.length
        ) + 3;
        worksheet.mergeCells(noteRow, 1, noteRow, 8);
        worksheet.getCell(noteRow, 1).value = (
            'Lưu ý: “Tổng tiền sản phẩm” chưa gồm phí giao hàng, thuế hoặc thanh toán '
            + 'vì database hiện chưa lưu các trường này. File chứa email, số điện thoại, '
            + 'địa chỉ và ghi chú giao hàng; chỉ sử dụng cho nghiệp vụ quản trị.'
        );
        worksheet.getCell(noteRow, 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.amberLight }
        };
        worksheet.getCell(noteRow, 1).font = { italic: true, color: { argb: COLORS.amber } };
        worksheet.getCell(noteRow, 1).alignment = { wrapText: true, vertical: 'middle' };
        worksheet.getRow(noteRow).height = 45;
    }

    function createWorkbook(report) {
        if (typeof window.ExcelJS === 'undefined') {
            throw new Error('Thư viện tạo Excel chưa được tải. Hãy kiểm tra kết nối mạng và tải lại trang.');
        }

        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = 'TECH.NO Admin';
        workbook.lastModifiedBy = 'TECH.NO Admin';
        workbook.created = report.exportedAt;
        workbook.modified = report.exportedAt;
        workbook.subject = 'Báo cáo quản trị cửa hàng TECH.NO';
        workbook.title = 'TECH.NO - Báo cáo quản trị';
        workbook.description = (
            'Báo cáo lấy trực tiếp từ Supabase, đối chiếu với KPI dashboard '
            + 'và dữ liệu chi tiết tại thời điểm xuất.'
        );
        workbook.company = 'TECH.NO';
        workbook.calcProperties.fullCalcOnLoad = true;
        workbook.views = [{
            x: 0,
            y: 0,
            width: 16000,
            height: 10000,
            firstSheet: 0,
            activeTab: 0,
            visibility: 'visible'
        }];

        const summarySheet = workbook.addWorksheet('Tổng quan', {
            properties: { tabColor: { argb: COLORS.blue } }
        });
        const reconciliationSheet = workbook.addWorksheet('Đối chiếu', {
            properties: { tabColor: { argb: COLORS.green } }
        });
        const ordersSheet = workbook.addWorksheet('Đơn hàng', {
            properties: { tabColor: { argb: COLORS.amber } }
        });
        const detailSheet = workbook.addWorksheet('Chi tiết đơn', {
            properties: { tabColor: { argb: COLORS.amber } }
        });
        const productsSheet = workbook.addWorksheet('Sản phẩm - Tồn kho', {
            properties: { tabColor: { argb: COLORS.blue } }
        });
        const customersSheet = workbook.addWorksheet('Khách hàng đặt hàng', {
            properties: { tabColor: { argb: COLORS.slate } }
        });

        const derived = buildDerivedData(report);
        const detailLastRow = populateDetailSheet(detailSheet, report, derived);
        const orderLastRow = populateOrdersSheet(
            ordersSheet,
            report,
            derived,
            detailLastRow
        );
        const productLastRow = populateProductsSheet(productsSheet, report, derived);
        const customerLastRow = populateCustomersSheet(customersSheet, report, derived);
        populateReconciliationSheet(reconciliationSheet, report, derived);
        populateSummarySheet(
            summarySheet,
            report,
            orderLastRow,
            productLastRow,
            customerLastRow
        );

        return workbook;
    }

    function syncDashboardKpis(kpis) {
        const values = {
            'dashboard-revenue': dashboardCurrencyFormatter.format(toNumber(kpis.revenue_total)),
            'dashboard-orders': dashboardNumberFormatter.format(toNumber(kpis.order_total)),
            'dashboard-customers': dashboardNumberFormatter.format(toNumber(kpis.customer_total)),
            'dashboard-products': dashboardNumberFormatter.format(toNumber(kpis.product_total)),
            'products-total': dashboardNumberFormatter.format(toNumber(kpis.product_total)),
            'products-in-stock': dashboardNumberFormatter.format(toNumber(kpis.product_in_stock)),
            'products-low-stock': dashboardNumberFormatter.format(toNumber(kpis.product_low_stock)),
            'products-out-of-stock': dashboardNumberFormatter.format(toNumber(kpis.product_out_of_stock)),
            'orders-total': dashboardNumberFormatter.format(toNumber(kpis.order_total)),
            'orders-completed': dashboardNumberFormatter.format(toNumber(kpis.order_completed)),
            'orders-pending': dashboardNumberFormatter.format(toNumber(kpis.order_pending)),
            'orders-processing': dashboardNumberFormatter.format(toNumber(kpis.order_processing)),
            'orders-cancelled': dashboardNumberFormatter.format(toNumber(kpis.order_cancelled))
        };

        Object.entries(values).forEach(([name, value]) => {
            const element = document.querySelector(`[data-kpi="${name}"]`);
            if (element) {
                element.textContent = value;
                element.removeAttribute('title');
            }
        });
    }

    function buildFileName(date) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
            timeZone: 'Asia/Ho_Chi_Minh'
        })
            .formatToParts(date)
            .filter((part) => part.type !== 'literal')
            .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});

        return `TECHNO_BaoCao_${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}.xlsx`;
    }

    function downloadWorkbook(buffer, fileName) {
        const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE });
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = fileName;
        anchor.hidden = true;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    function setExportStatus(message, type = 'info') {
        const status = document.getElementById('adminExportStatus');
        if (!status) return;
        status.textContent = message;
        status.dataset.type = type;
    }

    function humanizeExportError(error) {
        if (error?.code === '42501' || error?.code === 'ADMIN_EXPORT_FORBIDDEN') {
            return 'Tài khoản hiện tại không có quyền xuất báo cáo.';
        }
        if (
            error?.code === 'ADMIN_AUTH_REQUIRED'
            || error?.name === 'AuthSessionMissingError'
            || /auth session missing/i.test(error?.message || '')
        ) {
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }
        if (error?.code === 'PGRST202') {
            return 'Database chưa cài đặt đầy đủ RPC dashboard để đối chiếu báo cáo.';
        }
        return error?.message || 'Không thể xuất báo cáo Excel.';
    }

    async function exportAdminReport() {
        const button = document.getElementById('exportAdminExcel');
        if (!button || button.disabled) return;

        const client = window.supabaseClient;
        if (!client) {
            setExportStatus('Không tìm thấy kết nối Supabase.', 'error');
            return;
        }
        if (typeof window.ExcelJS === 'undefined') {
            setExportStatus('Không thể tải thư viện Excel. Hãy tải lại trang.', 'error');
            return;
        }

        const defaultHtml = button.innerHTML;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Đang đối chiếu dữ liệu...</span>';
        setExportStatus('Đang tải toàn bộ dữ liệu trực tiếp từ database...', 'info');

        try {
            await requireAuthenticatedAdmin(client);
            const report = await loadConsistentReportData(client);
            syncDashboardKpis(report.kpis);

            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Đang tạo file Excel...</span>';
            const snapshotWarnings = report.snapshotMismatchCount || 0;
            setExportStatus(
                snapshotWarnings
                    ? `KPI/RPC đã khớp; ${snapshotWarnings} đơn có cảnh báo snapshot và sẽ được đánh dấu trong file.`
                    : 'KPI/RPC và snapshot đơn hàng đã khớp. Đang tạo workbook...',
                snapshotWarnings ? 'warning' : 'info'
            );

            const workbook = createWorkbook(report);
            const buffer = await workbook.xlsx.writeBuffer();
            downloadWorkbook(buffer, buildFileName(report.exportedAt));

            button.innerHTML = '<i class="fa-solid fa-check"></i><span>Đã xuất Excel</span>';
            setExportStatus(
                snapshotWarnings
                    ? (
                        `Đã xuất ${dashboardNumberFormatter.format(report.orders.length)} đơn hàng; `
                        + `${snapshotWarnings} cảnh báo snapshot nằm trong sheet Đối chiếu.`
                    )
                    : (
                        `Đã đối chiếu và xuất ${dashboardNumberFormatter.format(report.orders.length)} `
                        + 'đơn hàng; không phát hiện chênh lệch snapshot.'
                    ),
                snapshotWarnings ? 'warning' : 'success'
            );
            window.setTimeout(() => {
                if (button.isConnected && !button.disabled) button.innerHTML = defaultHtml;
            }, 2500);
        } catch (error) {
            console.error('Không thể xuất báo cáo quản trị:', error);
            button.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Xuất thất bại</span>';
            setExportStatus(humanizeExportError(error), 'error');
            window.setTimeout(() => {
                if (button.isConnected && !button.disabled) button.innerHTML = defaultHtml;
            }, 3500);
        } finally {
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    }

    function init() {
        const button = document.getElementById('exportAdminExcel');
        if (!button || document.body.dataset.adminPage !== 'overview') return;
        button.addEventListener('click', exportAdminReport);
    }

    window.technoAdminExcelExport = Object.freeze({
        calculateKpis,
        calculateMonthlyMetrics,
        calculateCategorySales,
        calculateOrderIntegrity,
        buildDerivedData,
        createWorkbook,
        loadConsistentReportData,
        exportAdminReport
    });

    document.addEventListener('DOMContentLoaded', init);
})();
