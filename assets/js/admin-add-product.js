// =====================================================================================
// SYSTEM INITIALIZATION: CORE FUNCTION TO INITIALIZE PRODUCT FORM LISTENERS
// =====================================================================================
function initProductForm() {
    console.log("=== [TECH.NO SYSTEM] JavaScript file admin-add-product.js loaded successfully! ===");

    // Bind DOM elements from your HTML form structure
    const productImageInput = document.getElementById('productImage');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const btnSaveProduct = document.getElementById('btnSaveProduct');

    // Quick debugging checkpoints
    console.log("Check File Input Element:", productImageInput);
    console.log("Check Preview Container Element:", imagePreviewContainer);

    // =====================================================================================
    // 1. INDEPENDENT LOGIC: IMAGE PREVIEW RENDERER (RUNS ENTIRELY ON CLIENT-SIDE)
    // =====================================================================================
    if (productImageInput && imagePreviewContainer) {
        // Listen to change event when admin selects image files from local machine
        productImageInput.addEventListener('change', function (event) {
            console.log("Change event triggered! Processing selected images...");
            
            // Clear out any previously rendered previews
            imagePreviewContainer.innerHTML = '';
            
            const files = event.target.files;
            console.log("Selected file list:", files);
            
            if (files && files.length > 0) {
                // Loop through each selected image file
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    // Initialize FileReader to convert file into Base64 string instantly
                    const reader = new FileReader();
                    
                    // Async event handler after file reading successfully finishes
                    reader.onload = function (e) {
                        console.log(`Successfully read file data [${i + 1}/${files.length}]`);
                        
                        // Create wrapper div for square grid layout aspect ratio 1:1
                        const previewItem = document.createElement('div');
                        previewItem.style.position = 'relative';
                        previewItem.style.width = '100%';
                        previewItem.style.paddingTop = '100%'; 
                        previewItem.style.borderRadius = '8px';
                        previewItem.style.overflow = 'hidden';
                        previewItem.style.border = '1px solid #e2e8f0';

                        // Create img element to display raw base64 data
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.position = 'absolute';
                        img.style.top = '0';
                        img.style.left = '0';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover'; // Prevent images from being stretched/distorted

                        // The first selected image (index 0) will be designated as primary cover photo
                        if (i === 0) {
                            const badge = document.createElement('span');
                            badge.innerText = 'Ảnh chính';
                            badge.style.position = 'absolute';
                            badge.style.bottom = '0';
                            badge.style.left = '0';
                            badge.style.right = '0';
                            badge.style.background = 'rgba(17, 24, 39, 0.8)';
                            badge.style.color = '#ffffff';
                            badge.style.fontSize = '10px';
                            badge.style.textAlign = 'center';
                            badge.style.padding = '2px 0';
                            badge.style.zIndex = '10';
                            previewItem.appendChild(badge);
                        }

                        // Append image into item wrapper, then push into container
                        previewItem.appendChild(img);
                        imagePreviewContainer.appendChild(previewItem);
                    };
                    
                    // Trigger the file reading execution
                    reader.readAsDataURL(file);
                }
            } else {
                console.log("No files selected or file selection cancelled.");
            }
        });
    } else {
        console.error("FATAL ERROR: 'productImage' or 'imagePreviewContainer' elements not found in DOM tree!");
    }

    // =====================================================================================
    // 2. SUPABASE LOGIC: STORAGE UPLOAD & SQL INSERTION INTO 'PUBLIC.PRODUCTS' TABLE
    // =====================================================================================
    if (btnSaveProduct) {
        btnSaveProduct.addEventListener('click', async function (event) {
            event.preventDefault();

            // Detect Supabase client connection from global window object
            const supabase = window.supabaseClient || window.supabase;
            if (!supabase) {
                alert('Connection Error: Supabase instance not found. Please check your supabase-config.js file!');
                return;
            }

            // Reference form inputs from your actual HTML
            const productNameInput = document.getElementById('productName');
            const productSkuInput = document.getElementById('productSku');
            const productCategorySelect = document.getElementById('productCategory');
            const productDescriptionTextarea = document.getElementById('productDescription');
            const productPriceInput = document.getElementById('productPrice');
            const productSalePriceInput = document.getElementById('productSalePrice');
            const productStockInput = document.getElementById('productStock');

            if (!productNameInput || !productPriceInput || !productImageInput) {
                alert('App Error: Missing critical input fields in the DOM tree.');
                return;
            }

            // Process and sanitize input values
            const name = productNameInput.value.trim();
            const sku = productSkuInput ? productSkuInput.value.trim() : '';
            const category_id = productCategorySelect ? productCategorySelect.value : null;
            const description = productDescriptionTextarea ? productDescriptionTextarea.value.trim() : '';
            const price = parseFloat(productPriceInput.value);
            const salePrice = productSalePriceInput ? parseFloat(productSalePriceInput.value) : 0;
            const stock = productStockInput ? parseInt(productStockInput.value) || 0 : 0;
            const files = productImageInput.files;

            // --- STRICLY VALIDATION CHANNELS ---
            if (name === '') {
                alert('Vui lòng nhập tên sản phẩm.');
                return;
            }
            if (sku === '') {
                alert('Vui lòng nhập mã SKU cho sản phẩm.');
                return;
            }
            if (isNaN(price) || price < 0) {
                alert('Giá bán sản phẩm không hợp lệ.');
                return;
            }
            if (!category_id || category_id === '') {
                alert('Vui lòng chọn danh mục sản phẩm.');
                return;
            }
            if (!files || files.length === 0) {
                alert('Vui lòng chọn ít nhất một hình ảnh.');
                return;
            }

            // --- AUTOMATIC CALCULATION FOR DISCOUNT PERCENT ---
            let discount_percent = 0;
            if (!isNaN(salePrice) && salePrice > 0 && salePrice < price) {
                discount_percent = Math.round(((price - salePrice) / price) * 100);
            }

            try {
                // Disable submit button to prevent double-click race conditions
                btnSaveProduct.disabled = true;
                btnSaveProduct.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải ảnh & lưu...';

                console.log('Initiating file uploading sequence to Supabase Storage...');
                const uploadedImageUrls = [];

                // Sequential loops to upload each file safely to the bucket
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileExtension = file.name.split('.').pop();
                    
                    // Formulate absolute unique string name to prevent file overwrites in the bucket
                    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
                    
                    // Upload the file directly to your lower-case bucket name 'products'
                    const { data: storageData, error: storageError } = await supabase
                        .storage
                        .from('products')
                        .upload(uniqueFileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (storageError) {
                        throw new Error(`Failed uploading file [${file.name}]: ${storageError.message}`);
                    }

                    // Retrieve public link URL
                    const { data: publicUrlData } = supabase
                        .storage
                        .from('products')
                        .getPublicUrl(uniqueFileName);

                    if (!publicUrlData || !publicUrlData.publicUrl) {
                        throw new Error(`Cannot resolve public URL for file [${file.name}].`);
                    }

                    uploadedImageUrls.push(publicUrlData.publicUrl);
                    console.log(`Uploaded successfully (${i + 1}/${files.length}): ${publicUrlData.publicUrl}`);
                }

                console.log('Storage upload complete. Inserting product database record into public.products...');

                // 100% CORRESPONDING MAP TO YOUR DATABASE TABLE SCHEMATICS
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .insert([
                        {
                            name: name,
                            sku: sku, 
                            description: description,
                            price: price,
                            discount_percent: discount_percent,
                            category_id: category_id,
                            brand: null, 
                            image_urls: uploadedImageUrls, // Passing Array of strings
                            stock: stock
                        }
                    ])
                    .select();

                if (productError) {
                    throw new Error(`Database transaction error: ${productError.message}`);
                }

                console.log('Product sync operation completed successfully.');
                alert('Thêm sản phẩm mới cùng danh sách hình ảnh thành công!');

                // Reset the form values
                const parentForm = productNameInput.closest('form');
                if (parentForm) {
                    parentForm.reset();
                }
                
                // Clear the preview screen
                if (imagePreviewContainer) {
                    imagePreviewContainer.innerHTML = '';
                }

            } catch (error) {
                console.error('Execution thread aborted with error:', error);
                alert(`Xảy ra lỗi: ${error.message}`);
            } finally {
                // Restore button state
                btnSaveProduct.disabled = false;
                btnSaveProduct.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu sản phẩm';
            }
        });
    }
}

// =====================================================================================
// DOM LIFECYCLE SAFETY GUARD: PREVENT MISSING RENDER STATES
// =====================================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductForm);
} else {
    initProductForm();
}