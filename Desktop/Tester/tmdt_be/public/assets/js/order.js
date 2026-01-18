(() => {
    const path = location.pathname;
    function getQueryParam(name) { const p = new URLSearchParams(location.search); return p.get(name); }
    function toMoney(n) { try { return Number(n).toLocaleString('vi-VN') + ' đ'; } catch { return n + ' đ'; } }
    function vnStatus(s) {
        switch ((s || '').toUpperCase()) {
            case 'PENDING': return 'Chờ xử lý';
            case 'SHIPPING': return 'Đang giao';
            case 'COMPLETE': return 'Hoàn tất';
            case 'CANCEL': return 'Đã hủy';
            default: return s || '';
        }
    }
    function vnPaymentMethod(m) {
        switch ((m || '').toLowerCase()) {
            case 'cod': return 'Thanh toán khi nhận hàng';
            case 'bank_transfer': return 'Chuyển khoản ngân hàng';
            case 'credit_card': return 'Thẻ tín dụng';
            case 'momo': return 'Ví MoMo';
            case 'zalopay': return 'ZaloPay';
            default: return m || 'Chưa xác định';
        }
    }
    function vnPaymentStatus(s) {
        switch ((s || '').toLowerCase()) {
            case 'pending': return 'Chờ thanh toán';
            case 'paid': return 'Đã thanh toán';
            case 'failed': return 'Thanh toán thất bại';
            case 'refunded': return 'Đã hoàn tiền';
            default: return s || 'Chưa xác định';
        }
    }

    // ========== /admin/order/show.html ==========
    function orderList_getQueryParams() {
        const p = new URLSearchParams(location.search);
        return { page: parseInt(p.get('page') || '1'), status: p.get('status') || '', search: p.get('search') || '' };
    }
    function orderList_buildPageUrl(page) { const p = new URLSearchParams(location.search); p.set('page', page); return `/admin/order/show.html?${p.toString()}`; }
    function orderList_syncControls(params) {
        const s = document.getElementById('statusFilter'); if (s) s.value = params.status;
        const se = document.getElementById('searchInput'); if (se) se.value = params.search;
    }
    async function orderList_load() {
        const params = orderList_getQueryParams(); orderList_syncControls(params);
        const token = localStorage.getItem('token');
        const q = new URLSearchParams(); if (params.page) q.set('page', params.page); q.set('limit', '10');
        if (params.status) q.set('status', params.status); if (params.search) q.set('search', params.search);
        const res = await fetch(`/api/admin/orders?${q.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const tbody = document.getElementById('ordersTbody');
        const info = document.getElementById('listInfo');
        const pager = document.getElementById('pagination');
        if (!res.ok || !json.success) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${json.message || 'Tải dữ liệu thất bại'}</td></tr>`;
            if (pager) pager.innerHTML = '';
            if (info) info.textContent = '';
            return;
        }
        const data = json.data || {}; const orders = data.orders || [];
        const pg = data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 };
        if (tbody) {
            if (!orders.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có đơn hàng.</td></tr>';
            } else {
                tbody.innerHTML = orders.map(o => `
          <tr>
            <th>${o.id}</th>
            <td>${toMoney(o.totalPrice)}</td>
                        <td>${o.user?.fullName || o.user?.email || 'Không có'}</td>
                        <td><span class="badge bg-secondary">${vnStatus(o.status)}</span></td>
            <td>
                            <a class="btn btn-success btn-sm" href="/admin/order/detail.html?id=${o.id}">Xem</a>
                            <a class="btn btn-warning btn-sm mx-1" href="/admin/order/update.html?id=${o.id}">Cập nhật</a>
                            <a class="btn btn-danger btn-sm" href="/admin/order/delete.html?id=${o.id}">Xóa</a>
            </td>
          </tr>
        `).join('');
            }
        }
        if (info) info.textContent = `Trang ${pg.currentPage}/${pg.totalPages} — ${pg.totalItems} đơn`;
        if (pager) {
            const items = [];
            const disablePrev = pg.currentPage <= 1; const disableNext = pg.currentPage >= pg.totalPages;
            items.push(`<li class="page-item ${disablePrev ? 'disabled' : ''}"><a class="page-link" href="${orderList_buildPageUrl(pg.currentPage - 1)}" aria-label="Previous">&laquo;</a></li>`);
            for (let i = 1; i <= pg.totalPages; i++) items.push(`<li class="page-item ${i === pg.currentPage ? 'active' : ''}"><a class="page-link" href="${orderList_buildPageUrl(i)}">${i}</a></li>`);
            items.push(`<li class="page-item ${disableNext ? 'disabled' : ''}"><a class="page-link" href="${orderList_buildPageUrl(pg.currentPage + 1)}" aria-label="Next">&raquo;</a></li>`);
            pager.innerHTML = items.join('');
        }
    }

    // ========== /admin/order/detail.html ==========
    async function orderDetail_load() {
        const id = getQueryParam('id');
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/orders/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const body = document.getElementById('detailBody');
        const title = document.getElementById('title');
        const summary = document.getElementById('summary');
        if (!res.ok || !json.success) {
            if (body) body.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${json.message || 'Tải dữ liệu thất bại'}</td></tr>`;
            return;
        }
        const order = json.data;
        if (title) title.textContent = `Chi tiết đơn hàng (id = ${order.id})`;
        if (summary) summary.innerHTML = `
      <div class="alert alert-info">
        <div class="row">
          <div class="col-md-6">
            <div><strong>Trạng thái đơn hàng:</strong> ${vnStatus(order.status)}</div>
            <div><strong>Người đặt:</strong> ${order.user?.fullName || order.user?.email || 'Không có'}</div>
            <div><strong>Tổng tiền:</strong> ${toMoney(order.totalPrice)}</div>
            <div><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || 'Chưa có'}</div>
          </div>
          <div class="col-md-6">
            <div><strong>Người nhận:</strong> ${order.recipientName || 'Chưa có'}</div>
            <div><strong>SĐT người nhận:</strong> ${order.recipientPhone || 'Chưa có'}</div>
            <div><strong>Phương thức thanh toán:</strong> ${vnPaymentMethod(order.paymentMethod)}</div>
            <div><strong>Trạng thái thanh toán:</strong> ${vnPaymentStatus(order.paymentStatus)}</div>
            <div><strong>Phương thức vận chuyển:</strong> ${order.deliveryMethod || 'Chưa xác định'}</div>
            ${order.notes ? `<div><strong>Ghi chú:</strong> ${order.notes}</div>` : ''}
          </div>
        </div>
      </div>`;
        const rows = (order.orderDetails || []).map(od => {
            const p = od.product || {};
            const line = (Number(od.price) || 0) * (Number(od.quantity) || 0);
            const imgSrc = p.image ? (p.image.startsWith('/') ? p.image : '/' + p.image) : '';
            return `
        <tr>
          <th scope="row">
            <div class="d-flex align-items-center">
                            <img src="${imgSrc}" class="img-fluid me-3 rounded-circle" style="width: 80px; height: 80px;" alt="">
            </div>
          </th>
                    <td><p class="mb-0 mt-4">${p.name || 'Không có'}</p></td>
                    <td><p class="mb-0 mt-4">${toMoney(od.price)}</p></td>
          <td>
            <div class="input-group quantity mt-4" style="width: 100px;">
              <input type="text" class="form-control form-control-sm text-center border-0" value="${od.quantity}" disabled>
            </div>
          </td>
          <td><p class="mb-0 mt-4">${toMoney(line)}</p></td>
        </tr>`;
        });
        if (body) body.innerHTML = rows.length ? rows.join('') : '<tr><td colspan="5" class="text-center">Không có sản phẩm</td></tr>';
    }

    // ========== /admin/order/update.html ==========
    function orderUpdate_setMsg(type, text) { const el = document.getElementById('message'); if (el) el.innerHTML = `<div class="alert alert-${type}">${text}</div>`; }
    async function orderUpdate_load() {
        const id = getQueryParam('id');
        if (!id) { orderUpdate_setMsg('danger', 'Thiếu id đơn hàng'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/orders/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const info = document.getElementById('orderInfo');
        if (!res.ok || !json.success) { if (info) info.textContent = json.message || 'Tải dữ liệu thất bại'; return; }
        const o = json.data;
        if (info) info.innerHTML = `#${o.id} — ${o.user?.fullName || o.user?.email || 'Không có'} — Tổng: ${toMoney(o.totalPrice)} — Hiện tại: <b>${vnStatus(o.status)}</b>`;
        const sel = document.getElementById('status'); if (sel) sel.value = o.status || 'PENDING';
    }
    async function orderUpdate_submit(e) {
        e.preventDefault();
        const id = getQueryParam('id');
        const status = document.getElementById('status').value;
        const token = localStorage.getItem('token');
        const btn = document.getElementById('submitBtn'); btn.disabled = true;
        try {
            const res = await fetch(`/api/admin/orders/${id}/status`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Cập nhật thất bại');
            orderUpdate_setMsg('success', 'Cập nhật trạng thái thành công. Đang chuyển...');
            setTimeout(() => { location.href = '/admin/order/show.html'; }, 800);
        } catch (err) {
            orderUpdate_setMsg('danger', err.message || 'Có lỗi xảy ra');
        } finally { btn.disabled = false; }
    }

    // ========== /admin/order/delete.html ==========
    function orderDelete_setMessage(html, type = 'info') { const el = document.getElementById('message'); if (el) el.innerHTML = `<div class="alert alert-${type}">${html}</div>`; }
    async function orderDelete_do() {
        const id = getQueryParam('id');
        if (!id) return orderDelete_setMessage('Thiếu tham số id', 'danger');
        const btn = document.getElementById('confirmBtn'); btn.disabled = true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Xóa thất bại');
            orderDelete_setMessage('Xóa đơn hàng thành công. Đang chuyển...', 'success');
            setTimeout(() => { location.href = '/admin/order/show.html'; }, 800);
        } catch (err) {
            console.error(err);
            orderDelete_setMessage(err.message || 'Có lỗi xảy ra khi xóa', 'danger');
        } finally { btn.disabled = false; }
    }

    // Router
    document.addEventListener('DOMContentLoaded', () => {
        if (path.endsWith('/admin/order/show.html')) {
            const apply = document.getElementById('applyFilter');
            if (apply) apply.addEventListener('click', () => {
                const status = document.getElementById('statusFilter').value;
                const search = document.getElementById('searchInput').value.trim();
                const p = new URLSearchParams(location.search);
                if (status) p.set('status', status); else p.delete('status');
                if (search) p.set('search', search); else p.delete('search');
                p.set('page', '1');
                location.href = `/admin/order/show.html?${p.toString()}`;
            });
            orderList_load().catch(() => {
                const tbody = document.getElementById('ordersTbody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Tải dữ liệu thất bại.</td></tr>';
            });
        } else if (path.endsWith('/admin/order/detail.html')) {
            orderDetail_load().catch(() => { });
        } else if (path.endsWith('/admin/order/update.html')) {
            orderUpdate_load().catch(() => { });
            document.getElementById('statusForm')?.addEventListener('submit', orderUpdate_submit);
        } else if (path.endsWith('/admin/order/delete.html')) {
            const id = getQueryParam('id');
            if (id) { const title = document.getElementById('title'); if (title) title.textContent = `Xóa đơn hàng (id = ${id})`; }
            document.getElementById('confirmBtn')?.addEventListener('click', orderDelete_do);
        }
    });
})();
