(() => {
    'use strict';

    const STORAGE_BUCKET = 'products';
    const MAX_IMAGE_COUNT = 8;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = new Map([
        ['image/jpeg', 'jpg'],
        ['image/png', 'png'],
        ['image/webp', 'webp']
    ]);
    const PRODUCT_STATUSES = new Set(['active', 'hidden', 'out_of_stock']);
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const state = {
        client: null,
        productId: null,
        originalUpdatedAt: null,
        existingImageUrls: [],
        removedExistingUrls: new Set(),
        selectedFiles: [],
        previewObjectUrls: [],
        uploadGroupId: createUniqueId(),
        saving: false,
        completed: false,
        initialized: false,
        dirty: false
    };

    let elements = null;

    function createUniqueId() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined && text !== null) element.textContent = String(text);
        return element;
    }

    function showMessage(message, type = 'info') {
        elements.message.textContent = message;
        elements.message.className = `form-message ${type}`;
        elements.message.hidden = false;
        if (type === 'error') {
            window.requestAnimationFrame(() => {
                elements.message.scrollIntoView({ behavior: 'smooth', block: 'center' });
                elements.message.focus({ preventScroll: true });
            });
        }
    }

    function clearMessage() {
        elements.message.textContent = '';
        elements.message.hidden = true;
    }

    function setControlsDisabled(disabled) {
        elements.form.querySelectorAll('input, select, textarea').forEach((control) => {
            control.disabled = disabled;
        });
        elements.saveButton.disabled = disabled;
    }

    function setNavigationLocked(locked) {
        document.querySelectorAll('.product-cancel-link').forEach((link) => {
            if (locked) {
                link.setAttribute('aria-disabled', 'true');
                link.setAttribute('tabindex', '-1');
            } else {
                link.removeAttribute('aria-disabled');
                link.removeAttribute('tabindex');
            }
        });
    }

    function renderSaveButton(isLoading = false) {
        elements.saveButton.replaceChildren();
        const icon = document.createElement('i');
        icon.className = isLoading
            ? 'fa-solid fa-spinner fa-spin'
            : 'fa-solid fa-floppy-disk';
        icon.setAttribute('aria-hidden', 'true');
        elements.saveButton.append(icon, document.createTextNode(
            isLoading
                ? (state.productId ? ' Đang cập nhật...' : ' Đang lưu...')
                : (state.productId ? ' Lưu thay đổi' : ' Lưu sản phẩm')
        ));
    }

    function setEditModeLabels() {
        if (!state.productId) return;
        document.title = 'Chỉnh sửa sản phẩm - tech.no';
        elements.pageTitle.textContent = 'Chỉnh sửa sản phẩm';
        elements.pageSubtitle.textContent = 'Cập nhật thông tin sản phẩm trong database';
        elements.formTitle.textContent = 'Thông tin cần chỉnh sửa';
        elements.formHint.textContent = 'Dữ liệu mới sẽ được lưu vào bảng products sau khi xác nhận.';
        const icon = elements.headerIcon.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-pen-to-square';
    }

    async function requireAdmin() {
        const { data: userData, error: userError } = await state.client.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user) {
            throw new Error('Bạn cần đăng nhập bằng tài khoản quản trị viên.');
        }

        const { data: profile, error: profileError } = await state.client
            .from('users')
            .select('role')
            .eq('id', userData.user.id)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) {
            const profileError = new Error('Tài khoản đăng nhập chưa có hồ sơ trong bảng users.');
            profileError.code = 'ADMIN_PROFILE_MISSING';
            throw profileError;
        }
        if (profile?.role !== 'admin') {
            throw new Error('Tài khoản hiện tại không có quyền quản trị viên.');
        }
    }

    async function loadCategories() {
        const { data, error } = await state.client
            .from('categories')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) throw error;
        elements.category.replaceChildren(new Option('Chọn danh mục', ''));
        (data || []).forEach((category) => {
            elements.category.appendChild(new Option(category.name, category.id));
        });

        if (!data?.length) {
            throw new Error('Database chưa có danh mục sản phẩm.');
        }
    }

    async function loadProduct() {
        const { data: product, error } = await state.client
            .from('products')
            .select('id, sku, name, description, price, original_price, discount_percent, category_id, image_urls, stock, status, updated_at')
            .eq('id', state.productId)
            .single();

        if (error) throw error;
        if (!product) throw new Error('Không tìm thấy sản phẩm cần chỉnh sửa.');

        elements.name.value = product.name || '';
        elements.sku.value = product.sku || '';
        elements.category.value = product.category_id || '';
        elements.description.value = product.description || '';

        const currentPrice = Number(product.price) || 0;
        const originalPrice = product.original_price === null || product.original_price === undefined
            ? null
            : Number(product.original_price);
        const hasDiscount = Number.isFinite(originalPrice) && originalPrice > currentPrice;
        elements.price.value = hasDiscount ? String(originalPrice) : String(currentPrice);
        elements.salePrice.value = hasDiscount ? String(currentPrice) : '';
        elements.stock.value = String(Math.max(0, Number(product.stock) || 0));
        elements.status.value = PRODUCT_STATUSES.has(product.status) ? product.status : 'active';

        state.originalUpdatedAt = product.updated_at;
        state.existingImageUrls = Array.isArray(product.image_urls)
            ? [...new Set(product.image_urls.filter(
                (url) => typeof url === 'string' && getSafeImageUrl(url)
            ))]
            : [];
        renderImagePreviews();

        if (!elements.category.value) {
            throw new Error('Danh mục hiện tại của sản phẩm không còn tồn tại.');
        }
    }

    function getSafeImageUrl(value) {
        try {
            const parsed = new URL(String(value));
            return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
        } catch {
            return null;
        }
    }

    function revokePreviewObjectUrls() {
        state.previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
        state.previewObjectUrls = [];
    }

    function createImagePreview(imageUrl, label, onRemove) {
        const card = createElement('div', 'image-preview');
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = label;
        image.loading = 'lazy';

        const removeButton = createElement('button', 'image-preview__remove');
        removeButton.type = 'button';
        removeButton.title = `Bỏ ${label.toLowerCase()}`;
        removeButton.setAttribute('aria-label', removeButton.title);
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fa-solid fa-xmark';
        removeIcon.setAttribute('aria-hidden', 'true');
        removeButton.appendChild(removeIcon);
        removeButton.addEventListener('click', onRemove);

        card.append(image, removeButton, createElement('span', 'image-preview__label', label));
        return card;
    }

    function renderImagePreviews() {
        revokePreviewObjectUrls();
        elements.imagePreview.replaceChildren();

        state.existingImageUrls.forEach((url, index) => {
            const safeUrl = getSafeImageUrl(url);
            if (!safeUrl) return;
            elements.imagePreview.appendChild(createImagePreview(safeUrl, 'Ảnh hiện tại', () => {
                const [removedUrl] = state.existingImageUrls.splice(index, 1);
                if (removedUrl) state.removedExistingUrls.add(removedUrl);
                state.dirty = true;
                renderImagePreviews();
            }));
        });

        state.selectedFiles.forEach((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            state.previewObjectUrls.push(objectUrl);
            elements.imagePreview.appendChild(createImagePreview(objectUrl, 'Ảnh mới', () => {
                state.selectedFiles.splice(index, 1);
                state.dirty = true;
                renderImagePreviews();
            }));
        });

        if (!elements.imagePreview.children.length) {
            elements.imagePreview.appendChild(createElement('p', 'empty-images', 'Chưa có ảnh sản phẩm.'));
        }
    }

    function validateAndAddFiles(files) {
        const newFiles = Array.from(files || []);
        if (!newFiles.length) return;

        if (state.existingImageUrls.length + state.selectedFiles.length + newFiles.length > MAX_IMAGE_COUNT) {
            throw new Error(`Mỗi sản phẩm chỉ được có tối đa ${MAX_IMAGE_COUNT} ảnh.`);
        }

        newFiles.forEach((file) => {
            if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                throw new Error(`Ảnh “${file.name}” không phải JPEG, PNG hoặc WebP.`);
            }
            if (file.size > MAX_IMAGE_SIZE) {
                throw new Error(`Ảnh “${file.name}” vượt quá giới hạn 5 MB.`);
            }
        });

        const existingSignatures = new Set(state.selectedFiles.map((file) => (
            `${file.name}:${file.size}:${file.lastModified}`
        )));
        newFiles.forEach((file) => {
            const signature = `${file.name}:${file.size}:${file.lastModified}`;
            if (!existingSignatures.has(signature)) {
                state.selectedFiles.push(file);
                existingSignatures.add(signature);
            }
        });
        state.dirty = true;
        renderImagePreviews();
    }

    function syncStatusWithStock() {
        const stock = Number(elements.stock.value);
        if (!Number.isInteger(stock) || stock < 0) return;

        if (stock === 0 && elements.status.value !== 'hidden') {
            elements.status.value = 'out_of_stock';
        } else if (stock > 0 && elements.status.value === 'out_of_stock') {
            elements.status.value = 'active';
        }
    }

    function readAndValidateProduct() {
        const name = elements.name.value.trim();
        const sku = elements.sku.value.trim();
        const categoryId = elements.category.value;
        const description = elements.description.value.trim();
        const regularPrice = Number(elements.price.value);
        const salePriceText = elements.salePrice.value.trim();
        const salePrice = salePriceText === '' ? null : Number(salePriceText);
        const stock = Number(elements.stock.value);

        if (!name || !sku || !categoryId) {
            throw new Error('Tên sản phẩm, SKU và danh mục là bắt buộc.');
        }
        if (!Number.isFinite(regularPrice) || regularPrice < 0) {
            throw new Error('Giá bán thông thường phải là số không âm.');
        }
        if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
            throw new Error('Giá khuyến mãi phải là số không âm.');
        }
        if (salePrice !== null && salePrice > regularPrice) {
            throw new Error('Giá khuyến mãi không được lớn hơn giá bán thông thường.');
        }
        if (!Number.isInteger(stock) || stock < 0) {
            throw new Error('Số lượng tồn kho phải là số nguyên không âm.');
        }
        if (state.existingImageUrls.length + state.selectedFiles.length < 1) {
            throw new Error('Sản phẩm cần có ít nhất một hình ảnh.');
        }

        const effectivePrice = salePrice !== null ? salePrice : regularPrice;
        const hasDiscount = salePrice !== null && salePrice < regularPrice;
        const originalPrice = hasDiscount ? regularPrice : null;
        const discountPercent = hasDiscount && regularPrice > 0
            ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
            : 0;
        const requestedStatus = PRODUCT_STATUSES.has(elements.status.value)
            ? elements.status.value
            : 'active';
        const status = requestedStatus === 'hidden'
            ? 'hidden'
            : (stock === 0 ? 'out_of_stock' : 'active');

        return {
            sku,
            name,
            description: description || null,
            price: effectivePrice,
            original_price: originalPrice,
            discount_percent: discountPercent,
            category_id: categoryId,
            stock,
            status
        };
    }

    async function uploadSelectedImages(uploadedPaths) {
        const uploadedUrls = [];
        const folder = state.productId || state.uploadGroupId;

        for (const file of state.selectedFiles) {
            const extension = ALLOWED_IMAGE_TYPES.get(file.type);
            const objectPath = `${folder}/${createUniqueId()}.${extension}`;
            const { error: uploadError } = await state.client.storage
                .from(STORAGE_BUCKET)
                .upload(objectPath, file, {
                    cacheControl: '3600',
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;
            uploadedPaths.push(objectPath);

            const { data: publicUrlData } = state.client.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(objectPath);
            if (!publicUrlData?.publicUrl) {
                throw new Error('Không thể tạo URL công khai cho ảnh vừa tải lên.');
            }
            uploadedUrls.push(publicUrlData.publicUrl);
        }

        return uploadedUrls;
    }

    async function removeStoragePaths(paths) {
        if (!paths.length) return;
        const { error } = await state.client.storage.from(STORAGE_BUCKET).remove(paths);
        if (error) throw error;
    }

    function getOwnedStoragePath(publicUrl) {
        try {
            const parsedUrl = new URL(publicUrl);
            const projectOrigin = state.client.supabaseUrl
                ? new URL(state.client.supabaseUrl).origin
                : null;
            if (!projectOrigin || parsedUrl.origin !== projectOrigin) return null;

            const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
            const markerIndex = parsedUrl.pathname.indexOf(marker);
            if (markerIndex < 0) return null;

            const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);
            const decodedPath = encodedPath ? decodeURIComponent(encodedPath) : null;
            if (!decodedPath || !state.productId || !decodedPath.startsWith(`${state.productId}/`)) {
                return null;
            }
            return decodedPath;
        } catch {
            return null;
        }
    }

    async function cleanupRemovedExistingImages() {
        const removablePaths = [];
        for (const removedUrl of state.removedExistingUrls) {
            const ownedPath = getOwnedStoragePath(removedUrl);
            if (!ownedPath) continue;

            const { data: otherReferences, error: referenceError } = await state.client
                .from('products')
                .select('id')
                .neq('id', state.productId)
                .contains('image_urls', [removedUrl])
                .limit(1);
            if (referenceError) {
                console.warn('Không thể kiểm tra ảnh có đang được sản phẩm khác sử dụng:', referenceError);
                continue;
            }
            if (!otherReferences?.length) removablePaths.push(ownedPath);
        }
        if (!removablePaths.length) return;

        try {
            await removeStoragePaths(removablePaths);
        } catch (error) {
            console.warn('Sản phẩm đã cập nhật nhưng chưa thể dọn một số ảnh cũ:', error);
        }
    }

    async function canSafelyRemoveFailedUploads({ mutationAttempted, error, payload, uploadedUrls }) {
        if (!mutationAttempted) return true;

        const definiteRollbackCodes = new Set([
            '23505',
            '23503',
            '23514',
            '42501',
            'PGRST116',
            'EDIT_CONFLICT'
        ]);
        if (definiteRollbackCodes.has(error?.code)) return true;

        try {
            let verificationQuery = state.client
                .from('products')
                .select('image_urls');
            verificationQuery = state.productId
                ? verificationQuery.eq('id', state.productId)
                : verificationQuery.eq('sku', payload.sku);

            const { data: product, error: verificationError } = await verificationQuery.maybeSingle();
            if (verificationError) return false;

            const referencedUrls = Array.isArray(product?.image_urls) ? product.image_urls : [];
            return !uploadedUrls.some((url) => referencedUrls.includes(url));
        } catch {
            return false;
        }
    }

    async function saveProduct(event) {
        event.preventDefault();
        if (state.saving) return;

        clearMessage();
        const uploadedPaths = [];
        let uploadedUrls = [];
        let payload = null;
        let mutationAttempted = false;
        let saveCompleted = false;

        try {
            if (!elements.form.reportValidity()) return;
            payload = readAndValidateProduct();

            state.saving = true;
            state.completed = false;
            setControlsDisabled(true);
            setNavigationLocked(true);
            renderSaveButton(true);

            uploadedUrls = await uploadSelectedImages(uploadedPaths);
            payload.image_urls = [...state.existingImageUrls, ...uploadedUrls];

            let savedProduct;
            mutationAttempted = true;
            if (state.productId) {
                let updateQuery = state.client
                    .from('products')
                    .update(payload)
                    .eq('id', state.productId);
                updateQuery = state.originalUpdatedAt == null
                    ? updateQuery.is('updated_at', null)
                    : updateQuery.eq('updated_at', state.originalUpdatedAt);

                const { data, error } = await updateQuery
                    .select('id, updated_at')
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    const conflictError = new Error('Không thể cập nhật vì sản phẩm đã thay đổi, đã bị xóa hoặc quyền admin không còn hợp lệ. Hãy tải lại trang và kiểm tra đăng nhập.');
                    conflictError.code = 'EDIT_CONFLICT';
                    throw conflictError;
                }
                savedProduct = data;
            } else {
                const { data, error } = await state.client
                    .from('products')
                    .insert(payload)
                    .select('id, updated_at')
                    .single();

                if (error) throw error;
                savedProduct = data;
            }

            if (!savedProduct?.id) throw new Error('Database không trả về sản phẩm vừa lưu.');
            await cleanupRemovedExistingImages();
            state.dirty = false;
            state.completed = true;
            saveCompleted = true;
            showMessage(
                state.productId ? 'Đã cập nhật sản phẩm thành công.' : 'Đã thêm sản phẩm thành công.',
                'success'
            );
            window.setTimeout(() => window.location.replace('admin-qly-sanpham.html'), 500);
        } catch (error) {
            const shouldRemoveUploads = uploadedPaths.length
                ? await canSafelyRemoveFailedUploads({ mutationAttempted, error, payload, uploadedUrls })
                : false;
            if (shouldRemoveUploads) {
                try {
                    await removeStoragePaths(uploadedPaths);
                } catch (cleanupError) {
                    console.warn('Không thể dọn ảnh vừa tải lên sau khi lưu thất bại:', cleanupError);
                }
            } else if (uploadedPaths.length) {
                console.warn('Giữ lại ảnh vừa tải lên vì chưa thể xác nhận database có tham chiếu ảnh hay không.');
            }
            console.error('Không thể lưu sản phẩm:', error);
            showMessage(getFriendlyErrorMessage(error), 'error');
        } finally {
            if (saveCompleted) {
                state.saving = true;
                setControlsDisabled(true);
                elements.saveButton.replaceChildren(
                    createElement('i', 'fa-solid fa-circle-check'),
                    document.createTextNode(' Đã lưu')
                );
            } else {
                state.saving = false;
                state.completed = false;
                setControlsDisabled(false);
                setNavigationLocked(false);
                renderSaveButton(false);
            }
        }
    }

    function getFriendlyErrorMessage(error) {
        if (error?.code === '23505') return 'SKU đã tồn tại. Hãy nhập một mã sản phẩm khác.';
        if (error?.code === '23503') return 'Danh mục đã chọn không còn tồn tại.';
        if (error?.code === '23514') return 'Dữ liệu không đáp ứng ràng buộc của database. Hãy kiểm tra giá, tồn kho và trạng thái.';
        if (error?.code === '42501') return 'Bạn không có quyền sửa sản phẩm. Hãy đăng nhập bằng tài khoản admin.';
        if (error?.code === 'ADMIN_PROFILE_MISSING') return error.message;
        if (error?.code === 'PGRST116') return 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị thay đổi.';
        if (error?.code === 'EDIT_CONFLICT') return error.message;
        return error?.message || 'Không thể lưu sản phẩm. Hãy thử lại.';
    }

    function bindEvents() {
        elements.form.addEventListener('submit', saveProduct);
        elements.form.addEventListener('input', () => {
            if (state.initialized) state.dirty = true;
        });
        elements.form.addEventListener('change', () => {
            if (state.initialized) state.dirty = true;
        });

        elements.imageInput.addEventListener('change', (event) => {
            try {
                validateAndAddFiles(event.target.files);
                clearMessage();
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                event.target.value = '';
            }
        });

        elements.stock.addEventListener('input', syncStatusWithStock);
        elements.status.addEventListener('change', syncStatusWithStock);

        document.querySelectorAll('.product-cancel-link').forEach((link) => {
            link.addEventListener('click', (event) => {
                if (state.saving && !state.completed) {
                    event.preventDefault();
                    showMessage('Sản phẩm đang được lưu. Vui lòng chờ thao tác hoàn tất.', 'info');
                    return;
                }
                if (!state.dirty || window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?')) {
                    state.dirty = false;
                    return;
                }
                event.preventDefault();
            });
        });

        window.addEventListener('beforeunload', (event) => {
            if (state.completed || (!state.dirty && !state.saving)) return;
            event.preventDefault();
            event.returnValue = '';
        });

        window.addEventListener('pagehide', revokePreviewObjectUrls);
    }

    async function init() {
        elements = {
            form: document.getElementById('productForm'),
            message: document.getElementById('productFormMessage'),
            saveButton: document.getElementById('btnSaveProduct'),
            name: document.getElementById('productName'),
            sku: document.getElementById('productSku'),
            category: document.getElementById('productCategory'),
            description: document.getElementById('productDescription'),
            price: document.getElementById('productPrice'),
            salePrice: document.getElementById('productSalePrice'),
            stock: document.getElementById('productStock'),
            status: document.getElementById('productStatus'),
            imageInput: document.getElementById('productImage'),
            imagePreview: document.getElementById('imagePreviewContainer'),
            pageTitle: document.getElementById('productPageTitle'),
            pageSubtitle: document.getElementById('productPageSubtitle'),
            formTitle: document.getElementById('productFormTitle'),
            formHint: document.getElementById('productFormHint'),
            headerIcon: document.getElementById('productHeaderIcon')
        };

        if (Object.values(elements).some((element) => !element)) {
            console.error('Trang sản phẩm thiếu thành phần form bắt buộc.');
            return;
        }

        state.client = window.supabaseClient;
        bindEvents();
        setControlsDisabled(true);
        renderImagePreviews();

        const rawProductId = new URLSearchParams(window.location.search).get('id');
        if (rawProductId) {
            if (!UUID_PATTERN.test(rawProductId)) {
                showMessage('ID sản phẩm không hợp lệ. Hãy quay lại danh sách sản phẩm.', 'error');
                renderSaveButton(false);
                return;
            }
            state.productId = rawProductId;
            setEditModeLabels();
        }

        if (!state.client) {
            showMessage('Không tìm thấy kết nối Supabase. Hãy kiểm tra file supabase-config.js.', 'error');
            renderSaveButton(false);
            return;
        }

        try {
            showMessage(state.productId ? 'Đang tải sản phẩm từ database...' : 'Đang kiểm tra quyền quản trị...', 'info');
            await requireAdmin();
            await loadCategories();
            if (state.productId) await loadProduct();

            state.initialized = true;
            state.dirty = false;
            setControlsDisabled(false);
            renderSaveButton(false);
            clearMessage();
        } catch (error) {
            console.error('Không thể khởi tạo form sản phẩm:', error);
            showMessage(getFriendlyErrorMessage(error), 'error');
            renderSaveButton(false);
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
