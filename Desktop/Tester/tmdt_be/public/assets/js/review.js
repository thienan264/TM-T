(() => {
    const path = location.pathname;
    function getQueryParam(name) { const p = new URLSearchParams(location.search); return p.get(name); }
    function formatDate(d) { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } }
    function renderStars(n) {
        let s = '';
        for (let i = 1; i <= 5; i++) {
            s += i <= n ? '<i class="fas fa-star text-warning"></i>' : '<i class="far fa-star text-muted"></i>';
        }
        return s;
    }

    // ========== /admin/review/show.html ==========
    function reviewList_getQueryParams() {
        const p = new URLSearchParams(location.search);
        return { page: parseInt(p.get('page') || '1') };
    }
    function reviewList_buildPageUrl(page) {
        const p = new URLSearchParams(location.search);
        p.set('page', page);
        return '/admin/review/show.html?' + p.toString();
    }

    async function reviewList_load() {
        const { page } = reviewList_getQueryParams();
        const token = localStorage.getItem('token');
        const q = new URLSearchParams({ page: String(page), limit: '10' });
        const res = await fetch('/api/admin/reviews?' + q.toString(), { headers: { 'Authorization': 'Bearer ' + token } });
        const json = await res.json();
        const tbody = document.getElementById('reviewTableBody');
        const pager = document.getElementById('pagination');

        if (!res.ok || !json.success) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">' + (json.message || 'Tai du lieu that bai') + '</td></tr>';
            if (pager) pager.innerHTML = '';
            return;
        }

        const data = json.data || {};
        const reviews = data.reviews || [];
        const pg = data.pagination || { currentPage: 1, totalPages: 1 };

        if (tbody) {
            if (!reviews.length) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">Khong co danh gia nao.</td></tr>';
            } else {
                tbody.innerHTML = reviews.map(r => {
                    const product = r.product || {};
                    const user = r.user || {};
                    const approvedBadge = r.isApproved
                        ? '<span class="badge bg-success">Da duyet</span>'
                        : '<span class="badge bg-warning">Chua duyet</span>';
                    return '<tr>' +
                        '<td>' + r.id + '</td>' +
                        '<td>' + (product.name || 'N/A') + '</td>' +
                        '<td>' + (user.fullName || user.email || 'N/A') + '</td>' +
                        '<td>' + renderStars(r.rating) + '</td>' +
                        '<td>' + (r.comment || '<em>Khong co binh luan</em>') + '</td>' +
                        '<td>' + approvedBadge + '</td>' +
                        '<td>' + formatDate(r.createdAt) + '</td>' +
                        '<td>' +
                            '<button class="btn btn-sm btn-info me-1" onclick="toggleApproval(' + r.id + ')">' + (r.isApproved ? 'Bo duyet' : 'Duyet') + '</button>' +
                            '<button class="btn btn-sm btn-danger" onclick="deleteReview(' + r.id + ')">Xoa</button>' +
                        '</td>' +
                        '</tr>';
                }).join('');
            }
        }

        if (pager) {
            const items = [];
            const disablePrev = pg.currentPage <= 1;
            const disableNext = pg.currentPage >= pg.totalPages;
            items.push('<li class="page-item ' + (disablePrev ? 'disabled' : '') + '"><a class="page-link" href="' + reviewList_buildPageUrl(pg.currentPage - 1) + '">&laquo;</a></li>');
            for (let i = 1; i <= pg.totalPages; i++) {
                items.push('<li class="page-item ' + (i === pg.currentPage ? 'active' : '') + '"><a class="page-link" href="' + reviewList_buildPageUrl(i) + '">' + i + '</a></li>');
            }
            items.push('<li class="page-item ' + (disableNext ? 'disabled' : '') + '"><a class="page-link" href="' + reviewList_buildPageUrl(pg.currentPage + 1) + '">&raquo;</a></li>');
            pager.innerHTML = items.join('');
        }
    }

    // Toggle approval
    window.toggleApproval = async function(reviewId) {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/reviews/' + reviewId + '/toggle-approval', {
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'That bai');
            location.reload();
        } catch (err) {
            alert(err.message || 'Co loi xay ra');
        }
    };

    // Delete review
    window.deleteReview = async function(reviewId) {
        if (!confirm('Ban co chac muon xoa danh gia nay?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/reviews/' + reviewId, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Xoa that bai');
            location.reload();
        } catch (err) {
            alert(err.message || 'Co loi xay ra');
        }
    };

    // Router
    document.addEventListener('DOMContentLoaded', () => {
        if (path.endsWith('/admin/review/show.html')) {
            reviewList_load().catch(() => {
                const tbody = document.getElementById('reviewTableBody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Tai du lieu that bai.</td></tr>';
            });
        }
    });
})();

