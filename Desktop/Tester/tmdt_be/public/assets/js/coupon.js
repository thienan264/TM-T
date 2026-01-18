(() => {
    const path = location.pathname;
    function getQueryParam(name) { const p = new URLSearchParams(location.search); return p.get(name); }
    function money(n) { try { return Number(n).toLocaleString('vi-VN'); } catch { return n; } }
    function formatDate(d) {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
    }
    function toInputDate(d) {
        if (!d) return '';
        try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
    }

    // ========== /admin/coupon/show.html ==========
    function couponList_getQueryParams() {
        const p = new URLSearchParams(location.search);
        return { page: parseInt(p.get('page') || '1') };
    }
    function couponList_buildPageUrl(page) {
        const p = new URLSearchParams(location.search);
        p.set('page', page);
        return '/admin/coupon/show.html?' + p.toString();
    }

    async function couponList_load() {
        const { page } = couponList_getQueryParams();
        const token = localStorage.getItem('token');
        const q = new URLSearchParams({ page: String(page), limit: '10' });
        const res = await fetch('/api/admin/coupons?' + q.toString(), { headers: { 'Authorization': 'Bearer ' + token } });
        const json = await res.json();
        const tbody = document.getElementById('couponTableBody');
        const pager = document.getElementById('pagination');

        if (!res.ok || !json.success) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">' + (json.message || 'Tai du lieu that bai') + '</td></tr>';
            if (pager) pager.innerHTML = '';
            return;
        }

        const data = json.data || {};
        const coupons = data.coupons || [];
        const pg = data.pagination || { currentPage: 1, totalPages: 1 };

        if (tbody) {
            if (!coupons.length) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">Chua co ma giam gia nao.</td></tr>';
            } else {
                tbody.innerHTML = coupons.map(c => {
                    const discountText = c.discountType === 'percent'
                        ? c.discountValue + '%'
                        : money(c.discountValue) + 'd';
                    const statusBadge = c.isActive
                        ? '<span class="badge bg-success">Kich hoat</span>'
                        : '<span class="badge bg-secondary">Vo hieu</span>';
                    const usageText = c.usageLimit ? (c.usedCount + '/' + c.usageLimit) : c.usedCount;
                    return '<tr>' +
                        '<td>' + c.id + '</td>' +
                        '<td><strong>' + c.code + '</strong></td>' +
                        '<td>' + (c.description || '') + '</td>' +
                        '<td>' + (c.discountType === 'percent' ? 'Phan tram' : 'Co dinh') + '</td>' +
                        '<td>' + discountText + '</td>' +
                        '<td>' + usageText + '</td>' +
                        '<td>' + statusBadge + '</td>' +
                        '<td>' +
                            '<a class="btn btn-sm btn-warning me-1" href="/admin/coupon/update.html?id=' + c.id + '">Sua</a>' +
                            '<button class="btn btn-sm btn-danger" onclick="deleteCoupon(' + c.id + ')">Xoa</button>' +
                        '</td>' +
                        '</tr>';
                }).join('');
            }
        }

        if (pager) {
            const items = [];
            const disablePrev = pg.currentPage <= 1;
            const disableNext = pg.currentPage >= pg.totalPages;
            items.push('<li class="page-item ' + (disablePrev ? 'disabled' : '') + '"><a class="page-link" href="' + couponList_buildPageUrl(pg.currentPage - 1) + '">&laquo;</a></li>');
            for (let i = 1; i <= pg.totalPages; i++) {
                items.push('<li class="page-item ' + (i === pg.currentPage ? 'active' : '') + '"><a class="page-link" href="' + couponList_buildPageUrl(i) + '">' + i + '</a></li>');
            }
            items.push('<li class="page-item ' + (disableNext ? 'disabled' : '') + '"><a class="page-link" href="' + couponList_buildPageUrl(pg.currentPage + 1) + '">&raquo;</a></li>');
            pager.innerHTML = items.join('');
        }
    }

    window.deleteCoupon = async function(id) {
        if (!confirm('Ban co chac muon xoa ma giam gia nay?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/coupons/' + id, {
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

    // ========== /admin/coupon/create.html ==========
    async function couponCreate_submit() {
        const code = document.getElementById('code').value.trim();
        const description = document.getElementById('description').value.trim();
        const discountType = document.getElementById('discountType').value;
        const discountValue = document.getElementById('discountValue').value;
        const minOrderValue = document.getElementById('minOrderValue').value;
        const maxDiscount = document.getElementById('maxDiscount').value;
        const usageLimit = document.getElementById('usageLimit').value;
        const isActive = document.getElementById('isActive').value === 'true';
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!code) { alert('Vui long nhap ma giam gia'); return; }
        if (!discountValue || Number(discountValue) <= 0) { alert('Gia tri giam phai > 0'); return; }

        const token = localStorage.getItem('token');
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code, description, discountType, discountValue,
                    minOrderValue: minOrderValue || 0,
                    maxDiscount: maxDiscount || null,
                    usageLimit: usageLimit || null,
                    isActive, startDate: startDate || null, endDate: endDate || null
                })
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Tao that bai');
            alert('Tao ma giam gia thanh cong');
            location.href = '/admin/coupon/show.html';
        } catch (err) {
            alert(err.message || 'Co loi xay ra');
        } finally {
            btn.disabled = false;
        }
    }

    // ========== /admin/coupon/update.html ==========
    async function couponUpdate_load() {
        const id = getQueryParam('id');
        if (!id) { alert('Thieu id ma giam gia'); return; }

        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/coupons/' + id, { headers: { 'Authorization': 'Bearer ' + token } });
        const json = await res.json();

        if (!res.ok || !json.success) {
            alert(json.message || 'Khong tai duoc ma giam gia');
            return;
        }

        const c = json.data;
        document.getElementById('couponId').value = c.id;
        document.getElementById('code').value = c.code || '';
        document.getElementById('description').value = c.description || '';
        document.getElementById('discountType').value = c.discountType || 'percent';
        document.getElementById('discountValue').value = c.discountValue || '';
        document.getElementById('minOrderValue').value = c.minOrderValue || '';
        document.getElementById('maxDiscount').value = c.maxDiscount || '';
        document.getElementById('usageLimit').value = c.usageLimit || '';
        document.getElementById('usedCount').value = c.usedCount || 0;
        document.getElementById('isActive').value = c.isActive ? 'true' : 'false';
        document.getElementById('startDate').value = toInputDate(c.startDate);
        document.getElementById('endDate').value = toInputDate(c.endDate);
    }

    async function couponUpdate_submit() {
        const id = document.getElementById('couponId').value;
        const code = document.getElementById('code').value.trim();
        const description = document.getElementById('description').value.trim();
        const discountType = document.getElementById('discountType').value;
        const discountValue = document.getElementById('discountValue').value;
        const minOrderValue = document.getElementById('minOrderValue').value;
        const maxDiscount = document.getElementById('maxDiscount').value;
        const usageLimit = document.getElementById('usageLimit').value;
        const isActive = document.getElementById('isActive').value === 'true';
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!code) { alert('Vui long nhap ma giam gia'); return; }
        if (!discountValue || Number(discountValue) <= 0) { alert('Gia tri giam phai > 0'); return; }

        const token = localStorage.getItem('token');
        const btn = document.getElementById('updateBtn');
        btn.disabled = true;

        try {
            const res = await fetch('/api/admin/coupons/' + id, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code, description, discountType, discountValue,
                    minOrderValue: minOrderValue || 0,
                    maxDiscount: maxDiscount || null,
                    usageLimit: usageLimit || null,
                    isActive, startDate: startDate || null, endDate: endDate || null
                })
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Cap nhat that bai');
            alert('Cap nhat thanh cong');
            location.href = '/admin/coupon/show.html';
        } catch (err) {
            alert(err.message || 'Co loi xay ra');
        } finally {
            btn.disabled = false;
        }
    }

    // Router
    document.addEventListener('DOMContentLoaded', () => {
        if (path.endsWith('/admin/coupon/show.html')) {
            couponList_load().catch(() => {
                const tbody = document.getElementById('couponTableBody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Tai du lieu that bai.</td></tr>';
            });
        } else if (path.endsWith('/admin/coupon/create.html')) {
            document.getElementById('submitBtn')?.addEventListener('click', couponCreate_submit);
        } else if (path.endsWith('/admin/coupon/update.html')) {
            couponUpdate_load().catch(() => {});
            document.getElementById('updateBtn')?.addEventListener('click', couponUpdate_submit);
        }
    });
})();

