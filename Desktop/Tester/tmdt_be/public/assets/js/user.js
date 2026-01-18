(() => {
    const path = location.pathname;

    // Common helpers
    function getQueryParam(name) {
        const p = new URLSearchParams(location.search);
        return p.get(name);
    }

    // ========== /admin/user/show.html ==========
    function userList_getQueryParams() {
        const p = new URLSearchParams(location.search);
        return { page: parseInt(p.get('page') || '1'), search: p.get('search') || '' };
    }
    function userList_buildPageUrl(page) {
        const p = new URLSearchParams(location.search);
        p.set('page', page);
        return `/admin/user/show.html?${p.toString()}`;
    }
    function userList_syncControls(params) {
        const si = document.getElementById('searchInput');
        if (si) si.value = params.search;
    }
    async function userList_load() {
        const params = userList_getQueryParams();
        userList_syncControls(params);
        const token = localStorage.getItem('token');
        const q = new URLSearchParams();
        if (params.page) q.set('page', params.page);
        q.set('limit', '10');
        if (params.search) q.set('search', params.search);
        const res = await fetch(`/api/admin/users?${q.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const tbody = document.getElementById('usersTbody');
        const pager = document.getElementById('pagination');
        const info = document.getElementById('listInfo');
        if (!res.ok || !json.success) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${json.message || 'Tải dữ liệu thất bại'}</td></tr>`;
            if (pager) pager.innerHTML = '';
            if (info) info.textContent = '';
            return;
        }
        const data = json.data || {};
        const users = data.users || [];
        const pg = data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 };

        if (tbody) {
            if (!users.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có người dùng.</td></tr>';
            } else {
                const mapRole = (r) => {
                    const n = (r && (r.name || r)) || '';
                    const up = String(n).toUpperCase();
                    if (up === 'ADMIN') return 'Quản trị viên';
                    if (up === 'USER') return 'Người dùng';
                    return n;
                };
                tbody.innerHTML = users.map(u => `
          <tr>
              <th>${u.id}</th>
              <td>${u.email}</td>
              <td>${u.fullName || ''}</td>
              <td>${mapRole(u.role)}</td>
              <td>
                  <a class="btn btn-success btn-sm" href="/admin/user/detail.html?id=${u.id}">Xem</a>
                  <a class="btn btn-warning btn-sm mx-1" href="/admin/user/update.html?id=${u.id}">Cập nhật</a>
                  <a class="btn btn-danger btn-sm" href="/admin/user/delete.html?id=${u.id}">Xóa</a>
              </td>
          </tr>
        `).join('');
            }
        }
        if (info) info.textContent = `Trang ${pg.currentPage}/${pg.totalPages} — ${pg.totalItems} người dùng`;

        if (pager) {
            const items = [];
            const disablePrev = pg.currentPage <= 1;
            const disableNext = pg.currentPage >= pg.totalPages;
            items.push(`<li class="page-item ${disablePrev ? 'disabled' : ''}"><a class="page-link" href="${userList_buildPageUrl(pg.currentPage - 1)}" aria-label="Previous">&laquo;</a></li>`);
            for (let i = 1; i <= pg.totalPages; i++) {
                items.push(`<li class="page-item ${i === pg.currentPage ? 'active' : ''}"><a class="page-link" href="${userList_buildPageUrl(i)}">${i}</a></li>`);
            }
            items.push(`<li class="page-item ${disableNext ? 'disabled' : ''}"><a class="page-link" href="${userList_buildPageUrl(pg.currentPage + 1)}" aria-label="Next">&raquo;</a></li>`);
            pager.innerHTML = items.join('');
        }
    }

    // ========== /admin/user/detail.html ==========
    async function userDetail_load() {
        const id = getQueryParam('id');
        if (!id) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/users/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const ul = document.getElementById('userInfo');
        if (!res.ok || !json.success) {
            if (ul) ul.innerHTML = `<li class="list-group-item text-danger">${json.message || 'Tải dữ liệu thất bại'}</li>`;
            return;
        }
        const u = json.data;
        const roleVi = (() => { const n = (u.role && (u.role.name || u.role)) || ''; const up = String(n).toUpperCase(); if (up === 'ADMIN') return 'Quản trị viên'; if (up === 'USER') return 'Người dùng'; return n; })();
        if (ul) ul.innerHTML = `
            <li class="list-group-item"><strong>ID:</strong> ${u.id}</li>
            <li class="list-group-item"><strong>Email:</strong> ${u.email || ''}</li>
            <li class="list-group-item"><strong>Họ và tên:</strong> ${u.fullName || ''}</li>
            <li class="list-group-item"><strong>Số điện thoại:</strong> ${u.phone || ''}</li>
            <li class="list-group-item"><strong>Địa chỉ:</strong> ${u.address || ''}</li>
            <li class="list-group-item"><strong>Vai trò:</strong> ${roleVi}</li>
        `;
    }

    // ========== /admin/user/create.html ==========
    function userCreate_bindPreview() {
        const avatarFile = document.getElementById('avatarFile');
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarFile) {
            avatarFile.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    if (avatarPreview) { avatarPreview.src = url; avatarPreview.style.display = 'block'; }
                }
            });
        }
    }
    async function userCreate_submit() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const fullName = document.getElementById('fullName').value.trim();
        const address = document.getElementById('address').value.trim();
        const roleName = document.getElementById('roleName').value;
        if (!email || !password || !fullName) { alert('Vui lòng nhập email, mật khẩu, họ tên'); return; }
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email, password, phone, fullName, address, roleName })
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Tạo người dùng thất bại');
            alert('Tạo người dùng thành công');
            location.href = '/admin/user/show.html';
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            btn.disabled = false;
        }
    }

    // ========== /admin/user/update.html ==========
    function userUpdate_setMessage(html, type = 'info') {
        const el = document.getElementById('message');
        if (el) el.innerHTML = `<div class="alert alert-${type}">${html}</div>`;
    }
    async function userUpdate_load(userId) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to load user');
            const user = data?.data || data?.user || data;
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('address').value = user.address || '';
            const roleName = (user.role && user.role.name) || user.roleName || 'USER';
            document.getElementById('role').value = roleName;
        } catch (err) {
            console.error(err);
            userUpdate_setMessage(err.message || 'Error loading user', 'danger');
        }
    }
    async function userUpdate_submit(e) {
        e.preventDefault();
        const userId = getQueryParam('id');
        if (!userId) return userUpdate_setMessage('Thiếu tham số id người dùng', 'danger');

        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const roleName = document.getElementById('role').value;
        if (!fullName) return userUpdate_setMessage('Vui lòng nhập họ tên', 'warning');

        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        userUpdate_setMessage('Đang cập nhật...', 'info');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ fullName, phone, address, roleName })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Cập nhật thất bại');
            userUpdate_setMessage('Cập nhật người dùng thành công. Đang chuyển...', 'success');
            setTimeout(() => { window.location.href = '/admin/user/show.html'; }, 800);
        } catch (err) {
            console.error(err);
            userUpdate_setMessage(err.message || 'Có lỗi xảy ra khi cập nhật', 'danger');
        } finally {
            btn.disabled = false;
        }
    }

    // ========== /admin/user/delete.html ==========
    function userDelete_setMessage(html, type = 'info') {
        const el = document.getElementById('message');
        if (el) el.innerHTML = `<div class="alert alert-${type}">${html}</div>`;
    }
    async function userDelete_do() {
        const id = getQueryParam('id');
        if (!id) return userDelete_setMessage('Thiếu tham số id', 'danger');
        const btn = document.getElementById('confirmBtn');
        btn.disabled = true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Xóa thất bại');
            userDelete_setMessage('Xóa người dùng thành công. Đang chuyển...', 'success');
            setTimeout(() => { location.href = '/admin/user/show.html'; }, 800);
        } catch (err) {
            console.error(err);
            userDelete_setMessage(err.message || 'Có lỗi xảy ra khi xóa', 'danger');
        } finally {
            btn.disabled = false;
        }
    }

    // Router
    document.addEventListener('DOMContentLoaded', () => {
        if (path.endsWith('/admin/user/show.html')) {
            const apply = document.getElementById('applyFilter');
            if (apply) {
                apply.addEventListener('click', () => {
                    const search = document.getElementById('searchInput').value.trim();
                    const p = new URLSearchParams(location.search);
                    if (search) p.set('search', search); else p.delete('search');
                    p.set('page', '1');
                    location.href = `/admin/user/show.html?${p.toString()}`;
                });
            }
            userList_load().catch(() => {
                const tbody = document.getElementById('usersTbody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Tải dữ liệu thất bại.</td></tr>';
            });
        } else if (path.endsWith('/admin/user/detail.html')) {
            userDetail_load().catch(() => { });
        } else if (path.endsWith('/admin/user/create.html')) {
            userCreate_bindPreview();
            const btn = document.getElementById('submitBtn');
            btn?.addEventListener('click', userCreate_submit);
        } else if (path.endsWith('/admin/user/update.html')) {
            const userId = getQueryParam('id');
            if (!userId) {
                userUpdate_setMessage('Thiếu tham số id người dùng', 'danger');
            } else {
                userUpdate_load(userId);
                document.getElementById('user-update-form').addEventListener('submit', userUpdate_submit);
            }
        } else if (path.endsWith('/admin/user/delete.html')) {
            const id = getQueryParam('id');
            if (id) {
                const title = document.getElementById('title');
                if (title) title.textContent = `Xóa người dùng (id = ${id})`;
            }
            document.getElementById('confirmBtn')?.addEventListener('click', userDelete_do);
        }
    });
})();
