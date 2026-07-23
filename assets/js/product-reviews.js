(function initializeProductReviewsModule() {
    'use strict';

    const state = {
        productId: '',
        currentUser: null,
        selectedRating: 0,
        isSubmitting: false,
        isBound: false,
        elements: null
    };

    async function init(product) {
        const productId = String(product?.id || '').trim();
        const elements = getReviewElements();

        if (!elements || !productId) return;

        state.productId = productId;
        state.elements = elements;

        bindReviewForm();
        setReviewListState('Đang tải đánh giá...');

        if (!window.supabaseClient) {
            setFormMessage('Không thể kết nối Supabase để gửi đánh giá.', 'error');
            setReviewListState('Không thể kết nối database để tải đánh giá.', 'error');
            updateFormAvailability();
            return;
        }

        await refreshCurrentUser();
        renderAuthState();
        await loadReviews();
    }

    function getReviewElements() {
        const form = document.getElementById('product-review-form');
        const list = document.getElementById('product-review-list');

        if (!form || !list) return null;

        return {
            form,
            list,
            summary: document.getElementById('review-summary'),
            comment: document.getElementById('review-comment'),
            submit: document.getElementById('review-submit'),
            message: document.getElementById('review-form-message'),
            ratingInput: document.getElementById('rating-value'),
            ratingDescription: document.getElementById('rating-description'),
            ratingButtons: [...document.querySelectorAll('#star-rating [data-rating]')]
        };
    }

    function bindReviewForm() {
        if (state.isBound || !state.elements) return;

        state.elements.ratingButtons.forEach(button => {
            button.addEventListener('click', () => {
                setSelectedRating(Number(button.dataset.rating));
                setFormMessage('');
            });
        });

        state.elements.form.addEventListener('submit', submitReview);
        state.isBound = true;
        setSelectedRating(0);
        updateFormAvailability();
    }

    async function refreshCurrentUser() {
        const client = window.supabaseClient;

        if (!client) {
            state.currentUser = null;
            return;
        }

        const { data, error } = await client.auth.getSession();

        if (error) {
            console.warn('Không thể kiểm tra tài khoản đánh giá:', error.message);
        }

        state.currentUser = data?.session?.user || null;
        updateFormAvailability();
    }

    function renderAuthState() {
        if (!state.elements?.message) return;

        if (!window.supabaseClient) {
            setFormMessage('Không thể kết nối Supabase để gửi đánh giá.', 'error');
            return;
        }

        if (!state.currentUser) {
            const loginLink = document.createElement('a');
            loginLink.href = '/pages/login.html';
            loginLink.textContent = 'đăng nhập';

            state.elements.message.replaceChildren(
                document.createTextNode('Vui lòng '),
                loginLink,
                document.createTextNode(' để gửi đánh giá.')
            );
            state.elements.message.dataset.state = 'info';
            return;
        }

        setFormMessage('Chọn từ 1 đến 5 sao và chia sẻ trải nghiệm của bạn.');
    }

    function setSelectedRating(value) {
        const normalizedRating = Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0;
        state.selectedRating = normalizedRating;

        if (state.elements?.ratingInput) {
            state.elements.ratingInput.value = String(normalizedRating);
        }

        state.elements?.ratingButtons.forEach(button => {
            const isSelected = Number(button.dataset.rating) <= normalizedRating;
            button.classList.toggle('is-selected', isSelected);
            button.setAttribute('aria-pressed', String(isSelected));
        });

        if (state.elements?.ratingDescription) {
            state.elements.ratingDescription.textContent = normalizedRating
                ? `${normalizedRating}/5 sao`
                : 'Chưa chọn số sao';
        }
    }

    function updateFormAvailability() {
        if (!state.elements) return;

        const canSubmit = Boolean(
            window.supabaseClient
            && state.productId
            && state.currentUser
            && !state.isSubmitting
        );

        state.elements.ratingButtons.forEach(button => {
            button.disabled = !canSubmit;
        });

        if (state.elements.comment) {
            state.elements.comment.disabled = !canSubmit;
        }

        if (state.elements.submit) {
            state.elements.submit.disabled = !canSubmit;
            state.elements.submit.textContent = state.isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá';
        }
    }

    async function submitReview(event) {
        event.preventDefault();

        if (state.isSubmitting || !state.elements) return;

        const rating = state.selectedRating;
        const comment = state.elements.comment?.value.trim() || '';

        if (!state.currentUser) {
            renderAuthState();
            return;
        }

        if (rating < 1 || rating > 5) {
            setFormMessage('Vui lòng chọn số sao trước khi gửi.', 'error');
            return;
        }

        if (!comment) {
            setFormMessage('Vui lòng nhập nội dung nhận xét.', 'error');
            state.elements.comment?.focus();
            return;
        }

        if (comment.length > 1000) {
            setFormMessage('Nhận xét không được dài quá 1000 ký tự.', 'error');
            return;
        }

        state.isSubmitting = true;
        updateFormAvailability();
        setFormMessage('Đang gửi đánh giá...');

        try {
            const client = window.supabaseClient;
            const { data: authData, error: authError } = await client.auth.getUser();
            const user = authData?.user;

            if (authError || !user) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            state.currentUser = user;

            const { error } = await client.rpc('create_product_review', {
                p_product_id: state.productId,
                p_rating: rating,
                p_comment: comment
            });

            if (error) throw error;

            state.elements.form.reset();
            setSelectedRating(0);
            setFormMessage('Đánh giá của bạn đã được gửi thành công.', 'success');
            await loadReviews();
        } catch (error) {
            console.error('Không thể gửi đánh giá sản phẩm:', error);
            setFormMessage(getFriendlyReviewError(error), 'error');
        } finally {
            state.isSubmitting = false;
            updateFormAvailability();
        }
    }

    async function loadReviews() {
        const client = window.supabaseClient;
        const requestedProductId = state.productId;

        if (!client || !requestedProductId || !state.elements) return;

        setReviewListState('Đang tải đánh giá...');

        let { data: reviews, error } = await client.rpc('list_product_reviews', {
            p_product_id: requestedProductId
        });

        if (error) {
            console.warn('RPC list_product_reviews chưa sẵn sàng, chuyển sang truy vấn trực tiếp:', error.message);

            const fallbackResult = await client
                .from('product_reviews')
                .select('id, rating, comment, created_at')
                .eq('product_id', requestedProductId)
                .eq('is_visible', true)
                .order('created_at', { ascending: false })
                .limit(100);

            error = fallbackResult.error;
            reviews = (fallbackResult.data || []).map(review => ({
                ...review,
                reviewer_name: 'Khách hàng',
                is_own: false
            }));
        }

        if (requestedProductId !== state.productId) return;

        if (error) {
            console.error('Không thể tải đánh giá sản phẩm:', error);
            renderReviewSummary([]);
            setReviewListState('Không thể tải đánh giá. Vui lòng thử lại sau.', 'error');
            return;
        }

        renderReviews(reviews || []);
    }

    function renderReviews(reviews) {
        renderReviewSummary(reviews);

        if (!reviews.length) {
            setReviewListState('Sản phẩm chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.');
            return;
        }

        const fragment = document.createDocumentFragment();

        reviews.forEach(review => {
            fragment.appendChild(createReviewElement(review));
        });

        state.elements.list.replaceChildren(fragment);
    }

    function createReviewElement(review) {
        const rating = Math.min(5, Math.max(1, Number(review.rating) || 1));
        const reviewerName = getReviewerName(review);
        const article = document.createElement('article');
        const avatar = document.createElement('div');
        const main = document.createElement('div');
        const userInfo = document.createElement('div');
        const userDetails = document.createElement('div');
        const name = document.createElement('strong');
        const date = document.createElement('time');
        const ratingElement = document.createElement('div');
        const stars = document.createElement('span');
        const ratingValue = document.createElement('span');
        const comment = document.createElement('p');

        article.className = 'comment-item';
        avatar.className = 'review-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = getNameInitial(reviewerName);

        main.className = 'review-item-main';
        userInfo.className = 'user-info';
        userDetails.className = 'review-user-details';
        name.textContent = reviewerName;

        date.className = 'review-date';
        date.dateTime = review.created_at || '';
        date.textContent = formatReviewDate(review.created_at);

        ratingElement.className = 'review-rating';
        ratingElement.setAttribute('aria-label', `${rating} trên 5 sao`);
        stars.className = 'review-stars';
        stars.setAttribute('aria-hidden', 'true');

        for (let index = 1; index <= 5; index += 1) {
            const star = document.createElement('i');
            star.className = `fa-solid fa-star${index <= rating ? ' is-filled' : ''}`;
            stars.appendChild(star);
        }

        ratingValue.className = 'review-rating-value';
        ratingValue.textContent = `${rating}/5`;

        comment.textContent = String(review.comment || '').trim()
            || 'Người dùng chưa để lại nội dung nhận xét.';

        userDetails.append(name, date);
        ratingElement.append(stars, ratingValue);
        userInfo.append(userDetails, ratingElement);
        main.append(userInfo, comment);
        article.append(avatar, main);

        return article;
    }

    function renderReviewSummary(reviews) {
        if (!state.elements?.summary) return;

        if (!reviews.length) {
            state.elements.summary.textContent = 'Chưa có đánh giá';
            return;
        }

        const average = reviews.reduce((total, review) => total + Number(review.rating || 0), 0)
            / reviews.length;
        const formattedAverage = average.toLocaleString('vi-VN', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });

        state.elements.summary.textContent = `${formattedAverage}/5 · ${reviews.length} đánh giá`;
    }

    function setReviewListState(message, type = 'info') {
        if (!state.elements?.list) return;

        const stateElement = document.createElement('div');
        stateElement.className = 'review-state';
        stateElement.dataset.state = type;
        stateElement.textContent = message;
        state.elements.list.replaceChildren(stateElement);
    }

    function setFormMessage(message, type = 'info') {
        if (!state.elements?.message) return;

        state.elements.message.textContent = message;
        state.elements.message.dataset.state = type;
    }

    function getReviewerName(review) {
        let reviewerName = String(review.reviewer_name || '').trim();

        if (!reviewerName) {
            reviewerName = review.is_own ? getCurrentUserDisplayName() : 'Khách hàng';
        }

        if (!review.is_own || reviewerName === 'Bạn') return reviewerName;

        return `${reviewerName} (Bạn)`;
    }

    function getCurrentUserDisplayName() {
        const user = state.currentUser;

        return user?.user_metadata?.display_name
            || user?.user_metadata?.full_name
            || user?.email?.split('@')[0]
            || 'Bạn';
    }

    function getNameInitial(name) {
        const cleanName = String(name || 'K').replace('(Bạn)', '').trim();
        return cleanName.charAt(0).toLocaleUpperCase('vi-VN') || 'K';
    }

    function formatReviewDate(value) {
        const date = value ? new Date(value) : null;

        if (!date || Number.isNaN(date.getTime())) return 'Vừa xong';

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function getFriendlyReviewError(error) {
        const message = String(error?.message || '');

        if (/row-level security|permission denied|42501/i.test(message)) {
            return 'Bạn không có quyền gửi đánh giá. Hãy đăng nhập lại và thử tiếp.';
        }

        if (/foreign key|23503/i.test(message)) {
            return 'Không tìm thấy sản phẩm hoặc tài khoản phù hợp trong database.';
        }

        if (/create_product_review|PGRST202|schema cache/i.test(message)) {
            return 'Chức năng đánh giá chưa được kích hoạt trên database.';
        }

        return message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
    }

    window.ProductReviews = Object.freeze({ init });
})();
