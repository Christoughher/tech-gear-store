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
    const PRODUCT_SPECIFICATION_CONFIG = window.techNoProductSpecificationConfig;
    const CATEGORY_FORM_COPY = Object.freeze({
        phone: {
            label: 'Điện thoại',
            title: 'Thông số điện thoại',
            hint: 'Nhập màn hình, hệ điều hành, chip, RAM, bộ nhớ, pin và các thông tin phần cứng.'
        },
        laptop: {
            label: 'Laptop',
            title: 'Thông số laptop',
            hint: 'Nhập CPU, GPU, RAM, ổ cứng, màn hình, tần số quét, bàn phím và tản nhiệt.'
        },
        pc: {
            label: 'PC',
            title: 'Thông số máy tính để bàn',
            hint: 'Nhập mainboard, CPU, RAM, ổ cứng, card đồ họa, nguồn, case và hệ điều hành.'
        },
        phukien: {
            label: 'Phụ kiện',
            title: 'Thông số phụ kiện',
            hint: 'Chọn loại phụ kiện trước để nhận đúng bộ trường thông số.'
        }
    });
    const BRAND_SUGGESTIONS = Object.freeze({
        phone: ['iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo'],
        laptop: ['asus', 'hp', 'dell', 'acer', 'macbook', 'lenovo', 'msi', 'gigabyte'],
        pc: ['asus', 'msi', 'gigabyte'],
        phukien: ['apple', 'samsung', 'sony', 'tplink', 'ugreen', 'xiaomi', 'huawei', 'amazfit']
    });
    const LONG_SPECIFICATION_FIELDS = new Set([
        'storage',
        'cooling',
        'charging_time',
        'audio_technology',
        'compatibility',
        'input',
        'output',
        'battery_life'
    ]);
    const SPECIFICATION_PLACEHOLDERS = Object.freeze({
        screen: 'VD: OLED 6.7 inch, 120 Hz',
        os: 'VD: Windows 11 Home / Android 15',
        chip: 'VD: Snapdragon 8 Gen 3',
        ram: 'VD: 16 GB',
        storage: 'VD: 512 GB SSD NVMe PCIe',
        battery: 'VD: 5000 mAh',
        charging: 'VD: 67 W',
        material: 'VD: Khung nhôm, mặt lưng kính',
        sim: 'VD: 2 Nano SIM',
        cpu_technology: 'VD: Intel Core i5-13420H',
        cpu: 'VD: Intel Core i5-14400F',
        gpu: 'VD: NVIDIA GeForce RTX 4060 8 GB',
        screen_size: 'VD: 15.6 inch',
        resolution: 'VD: Full HD (1920 x 1080)',
        refresh_rate: 'VD: 144 Hz',
        keyboard_backlight: 'VD: RGB 4 vùng',
        cooling: 'VD: 2 quạt, 4 ống đồng',
        mainboard: 'VD: ASUS B760M',
        case: 'VD: Mid Tower',
        power_supply: 'VD: 650 W 80 Plus Bronze',
        charging_time: 'VD: Dùng 8 giờ, sạc 1.5 giờ',
        audio_technology: 'VD: Chống ồn chủ động, Spatial Audio',
        compatibility: 'VD: Android, iOS, Windows, macOS',
        simultaneous_connections: 'VD: 2 thiết bị',
        dimensions: 'VD: Dài 10 cm × rộng 7 cm × dày 2 cm',
        weight: 'VD: 250 g',
        face_diameter: 'VD: 46 mm',
        strap_material: 'VD: Silicone',
        strap_width: 'VD: 2.2 cm',
        frame_material: 'VD: Hợp kim nhôm',
        case_thickness: 'VD: 10.5 mm',
        glass_material: 'VD: Kính Sapphire',
        battery_life: 'VD: Khoảng 7 ngày',
        viewing_angle: 'VD: 105 độ',
        rotation_angle: 'VD: Ngang 360 độ, dọc 114 độ',
        infrared_range: 'VD: 10 m',
        input: 'VD: USB-C 5V/3A, 9V/2A',
        output: 'VD: USB-C PD 20 W',
        connection: 'VD: Bluetooth 5.3 / Wi-Fi',
        model: 'VD: Series 2026',
        origin: 'VD: Việt Nam',
        warranty: 'VD: 24 tháng'
    });

    const state = {
        client: null,
        productId: null,
        originalUpdatedAt: null,
        originalCategoryId: '',
        originalSubcategory: '',
        originalSpecifications: {},
        originalSpecificationsUpdatedAt: null,
        activeSpecificationContext: '',
        specificationDrafts: new Map(),
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

    function parseSpecificationObject(value) {
        if (!value) return {};
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                    ? parsed
                    : {};
            } catch {
                return {};
            }
        }
        return typeof value === 'object' && !Array.isArray(value)
            ? { ...value }
            : {};
    }

    function normalizeTaxonomySlug(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function populateAccessorySubcategories() {
        elements.subcategory.replaceChildren(new Option('Chọn loại phụ kiện', ''));
        PRODUCT_SPECIFICATION_CONFIG.accessorySubcategories.forEach((subcategory) => {
            elements.subcategory.appendChild(new Option(subcategory.label, subcategory.value));
        });
    }

    function ensureAccessorySubcategoryOption(value) {
        if (!value || [...elements.subcategory.options].some((option) => option.value === value)) {
            return;
        }
        elements.subcategory.appendChild(new Option(`${value} (đang sử dụng)`, value));
    }

    function updateBrandSuggestions(categoryId) {
        const suggestions = BRAND_SUGGESTIONS[categoryId]
            || [...new Set(Object.values(BRAND_SUGGESTIONS).flat())];
        elements.brandOptions.replaceChildren(
            ...suggestions.map((brand) => {
                const option = document.createElement('option');
                option.value = brand;
                return option;
            })
        );
    }

    function getSelectedCategoryLabel(categoryId) {
        const selectedOption = [...elements.category.options]
            .find((option) => option.value === categoryId);
        return CATEGORY_FORM_COPY[categoryId]?.label
            || selectedOption?.textContent?.trim()
            || categoryId;
    }

    function getSpecificationContext() {
        const categoryId = elements.category.value;
        const subcategory = categoryId === 'phukien'
            ? elements.subcategory.value
            : '';
        if (!categoryId) {
            return {
                key: '',
                categoryId: '',
                subcategory: '',
                title: 'Thông số theo loại sản phẩm',
                hint: 'Chọn danh mục để form hiển thị đúng các trường được lưu trong specifications.',
                badge: 'Chưa chọn danh mục',
                fields: [],
                needsSubcategory: false
            };
        }

        const categoryCopy = CATEGORY_FORM_COPY[categoryId];
        const categoryLabel = getSelectedCategoryLabel(categoryId);
        if (categoryId === 'phukien' && !subcategory) {
            return {
                key: `${categoryId}|`,
                categoryId,
                subcategory: '',
                title: categoryCopy.title,
                hint: categoryCopy.hint,
                badge: categoryCopy.label,
                fields: [],
                needsSubcategory: true
            };
        }

        let templateKey = PRODUCT_SPECIFICATION_CONFIG.categoryTemplateKeys[categoryId];
        let detailLabel = categoryLabel;
        if (categoryId === 'phukien') {
            templateKey = subcategory === 'tai-nghe'
                ? 'audio'
                : PRODUCT_SPECIFICATION_CONFIG.accessoryTemplateKeys[subcategory];
            detailLabel = PRODUCT_SPECIFICATION_CONFIG.accessorySubcategories
                .find((item) => item.value === subcategory)?.label
                || subcategory;
        }

        const template = PRODUCT_SPECIFICATION_CONFIG.templates[templateKey]
            || PRODUCT_SPECIFICATION_CONFIG.fallbackTemplate;
        const fields = template.filter(([key]) => key !== 'brand');

        return {
            key: `${categoryId}|${subcategory}`,
            categoryId,
            subcategory,
            title: categoryId === 'phukien'
                ? `Thông số ${detailLabel}`
                : (categoryCopy?.title || `Thông số ${categoryLabel}`),
            hint: categoryId === 'phukien'
                ? `Các trường dưới đây được lưu vào specifications cho nhóm ${detailLabel.toLowerCase()}.`
                : (categoryCopy?.hint || 'Nhập các thông số kỹ thuật phù hợp với danh mục này.'),
            badge: detailLabel,
            fields,
            needsSubcategory: false
        };
    }

    function getOriginalSpecificationContextKey() {
        const originalSubcategory = state.originalCategoryId === 'phukien'
            ? state.originalSubcategory
            : '';
        return state.originalCategoryId
            ? `${state.originalCategoryId}|${originalSubcategory}`
            : '';
    }

    function captureSpecificationDraft() {
        if (!state.activeSpecificationContext) return;
        const draft = {};
        elements.specificationFields.querySelectorAll('[data-spec-key]').forEach((control) => {
            draft[control.dataset.specKey] = control.value;
        });
        state.specificationDrafts.set(state.activeSpecificationContext, draft);
    }

    function createSpecificationField(key, label, value) {
        const isLongField = LONG_SPECIFICATION_FIELDS.has(key);
        const group = createElement('div', `form-group${isLongField ? ' full' : ''}`);
        const controlId = `productSpec-${key.replace(/[^a-z0-9_-]/gi, '-')}`;
        const fieldLabel = createElement('label', '', label);
        fieldLabel.htmlFor = controlId;

        const control = isLongField
            ? document.createElement('textarea')
            : document.createElement('input');
        if (control instanceof HTMLInputElement) control.type = 'text';
        if (control instanceof HTMLTextAreaElement) {
            control.rows = 2;
            control.className = 'specification-textarea';
        }
        control.id = controlId;
        control.dataset.specKey = key;
        control.maxLength = 1000;
        control.placeholder = SPECIFICATION_PLACEHOLDERS[key]
            || `Nhập ${label.toLowerCase()}`;
        control.value = value === undefined || value === null ? '' : String(value);
        control.disabled = state.saving || !state.initialized;

        const helperId = `${controlId}-helper`;
        const helper = createElement('span', 'field-helper', `Lưu vào products.specifications.${key}`);
        helper.id = helperId;
        control.setAttribute('aria-describedby', helperId);
        group.append(fieldLabel, control, helper);
        return group;
    }

    function renderSpecificationFields() {
        const categoryId = elements.category.value;
        const isAccessory = categoryId === 'phukien';
        elements.subcategoryGroup.hidden = !isAccessory;
        elements.subcategory.required = isAccessory;
        if (!isAccessory) elements.subcategory.value = '';
        updateBrandSuggestions(categoryId);

        const context = getSpecificationContext();
        state.activeSpecificationContext = context.key;
        elements.specificationTitle.textContent = context.title;
        elements.specificationHint.textContent = context.hint;
        elements.specificationBadge.textContent = context.badge;
        elements.specificationFields.replaceChildren();

        if (!context.categoryId) {
            elements.specificationFields.appendChild(createElement(
                'p',
                'dynamic-fields-empty',
                'Chọn danh mục sản phẩm để bắt đầu nhập thông số.'
            ));
            return;
        }
        if (context.needsSubcategory) {
            elements.specificationFields.appendChild(createElement(
                'p',
                'dynamic-fields-empty',
                'Chọn loại phụ kiện để hiển thị đúng các trường thông số.'
            ));
            return;
        }

        const originalContextKey = getOriginalSpecificationContextKey();
        const values = state.specificationDrafts.has(context.key)
            ? state.specificationDrafts.get(context.key)
            : (context.key === originalContextKey ? state.originalSpecifications : {});
        context.fields.forEach(([key, label]) => {
            elements.specificationFields.appendChild(
                createSpecificationField(key, label, values[key])
            );
        });
    }

    function collectCurrentSpecifications() {
        const context = getSpecificationContext();
        const shouldPreserveOriginal = context.key === getOriginalSpecificationContextKey();
        const specifications = shouldPreserveOriginal
            ? { ...state.originalSpecifications }
            : {};

        elements.specificationFields.querySelectorAll('[data-spec-key]').forEach((control) => {
            const key = control.dataset.specKey;
            const value = control.value.trim();
            if (value) {
                specifications[key] = value;
            } else {
                delete specifications[key];
            }
        });
        return specifications;
    }

    function haveEqualSpecifications(left, right) {
        const normalize = (value) => Object.fromEntries(
            Object.entries(value || {}).sort(([leftKey], [rightKey]) => (
                leftKey.localeCompare(rightKey)
            ))
        );
        return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
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
            .select('id, sku, name, description, short_description, price, original_price, discount_percent, category_id, brand, subcategory, specifications, source_url, specifications_updated_at, image_urls, stock, status, updated_at')
            .eq('id', state.productId)
            .single();

        if (error) throw error;
        if (!product) throw new Error('Không tìm thấy sản phẩm cần chỉnh sửa.');

        elements.name.value = product.name || '';
        elements.sku.value = product.sku || '';
        elements.category.value = product.category_id || '';
        elements.brand.value = product.brand || '';
        elements.shortDescription.value = product.short_description || '';
        elements.description.value = product.description || '';
        elements.sourceUrl.value = product.source_url || '';

        state.originalCategoryId = product.category_id || '';
        state.originalSubcategory = product.subcategory || '';
        state.originalSpecifications = parseSpecificationObject(product.specifications);
        state.originalSpecificationsUpdatedAt = product.specifications_updated_at || null;
        state.specificationDrafts.clear();
        ensureAccessorySubcategoryOption(state.originalSubcategory);
        elements.subcategory.value = state.originalSubcategory;
        renderSpecificationFields();

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
        const sku = elements.sku.value.trim().toUpperCase().replace(/\s+/g, '-');
        const categoryId = elements.category.value;
        const brand = normalizeTaxonomySlug(elements.brand.value);
        const subcategory = categoryId === 'phukien'
            ? elements.subcategory.value
            : null;
        const shortDescription = elements.shortDescription.value.trim();
        const description = elements.description.value.trim();
        const sourceUrlText = elements.sourceUrl.value.trim();
        const sourceUrl = sourceUrlText ? getSafeImageUrl(sourceUrlText) : null;
        const regularPrice = Number(elements.price.value);
        const salePriceText = elements.salePrice.value.trim();
        const salePrice = salePriceText === '' ? null : Number(salePriceText);
        const stock = Number(elements.stock.value);

        if (!name || !sku || !categoryId || !brand) {
            throw new Error('Tên sản phẩm, SKU, danh mục và thương hiệu là bắt buộc.');
        }
        if (categoryId === 'phukien' && !subcategory) {
            throw new Error('Hãy chọn loại phụ kiện để lưu đúng thông số và bộ lọc.');
        }
        if (sourceUrlText && !sourceUrl) {
            throw new Error('Trang thông tin tham khảo phải là URL HTTP hoặc HTTPS hợp lệ.');
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
        const specifications = collectCurrentSpecifications();
        const specificationContextChanged = getSpecificationContext().key
            !== getOriginalSpecificationContextKey();
        const specificationsChanged = specificationContextChanged
            || !haveEqualSpecifications(specifications, state.originalSpecifications);
        const specificationsUpdatedAt = specificationsChanged
            ? new Date().toISOString()
            : state.originalSpecificationsUpdatedAt;

        return {
            sku,
            name,
            brand,
            subcategory,
            short_description: shortDescription || null,
            description: description || null,
            price: effectivePrice,
            original_price: originalPrice,
            discount_percent: discountPercent,
            category_id: categoryId,
            specifications,
            source_url: sourceUrl,
            specifications_updated_at: specificationsUpdatedAt,
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
        elements.category.addEventListener('change', () => {
            captureSpecificationDraft();
            renderSpecificationFields();
        });
        elements.subcategory.addEventListener('change', () => {
            captureSpecificationDraft();
            renderSpecificationFields();
        });
        elements.brand.addEventListener('blur', () => {
            const normalizedBrand = normalizeTaxonomySlug(elements.brand.value);
            if (normalizedBrand !== elements.brand.value) {
                elements.brand.value = normalizedBrand;
                if (state.initialized) state.dirty = true;
            }
        });
        elements.sku.addEventListener('blur', () => {
            const normalizedSku = elements.sku.value.trim().toUpperCase().replace(/\s+/g, '-');
            if (normalizedSku !== elements.sku.value) {
                elements.sku.value = normalizedSku;
                if (state.initialized) state.dirty = true;
            }
        });

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
            brand: document.getElementById('productBrand'),
            brandOptions: document.getElementById('productBrandOptions'),
            subcategoryGroup: document.getElementById('productSubcategoryGroup'),
            subcategory: document.getElementById('productSubcategory'),
            shortDescription: document.getElementById('productShortDescription'),
            description: document.getElementById('productDescription'),
            sourceUrl: document.getElementById('productSourceUrl'),
            specificationTitle: document.getElementById('productSpecificationTitle'),
            specificationHint: document.getElementById('productSpecificationHint'),
            specificationBadge: document.getElementById('productSpecificationBadge'),
            specificationFields: document.getElementById('productSpecificationFields'),
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
        if (
            !PRODUCT_SPECIFICATION_CONFIG?.templates
            || !PRODUCT_SPECIFICATION_CONFIG?.accessorySubcategories
        ) {
            console.error('Không tìm thấy cấu hình thông số sản phẩm dùng chung.');
            showMessage('Không thể tải cấu hình thông số sản phẩm. Hãy kiểm tra file main.js.', 'error');
            return;
        }

        state.client = window.supabaseClient;
        populateAccessorySubcategories();
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
            if (state.productId) {
                await loadProduct();
            } else {
                renderSpecificationFields();
            }

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
