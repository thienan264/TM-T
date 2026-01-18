(() => {
    const path = location.pathname;
    function getQueryParam(name) { const p = new URLSearchParams(location.search); return p.get(name); }
    function money(n) { try { return Number(n).toLocaleString('vi-VN'); } catch { return n; } }
    function vnCategory(c) {
        const key = String(c || '').toLowerCase();
        switch (key) {
            case 'medical-measurement': return 'Thiết bị đo y tế';
            case 'respiratory-support': return 'Thiết bị hỗ trợ hô hấp';
            case 'medical-supplies': return 'Vật tư y tế';
            case 'health-care': return 'Chăm sóc sức khỏe';
            case 'rehabilitation-devices': return 'Thiết bị phục hồi chức năng';
            default: return c || '';
        }
    }
    function vnMedicalDeviceType(t) {
        const key = String(t || '').toLowerCase();
        switch (key) {
            case 'blood-pressure-monitor': return 'Máy đo huyết áp';
            case 'blood-glucose-meter': return 'Máy đo đường huyết';
            case 'thermometer': return 'Nhiệt kế';
            case 'pulse-oximeter': return 'Máy đo SpO2';
            case 'nebulizer': return 'Máy xông khí dung';
            case 'wheelchair': return 'Xe lăn';
            case 'other': return 'Khác';
            default: return t || '';
        }
    }
    function vnStatus(s) {
        const key = String(s || '').toLowerCase();
        switch (key) {
            case 'active': return 'Đang bán';
            case 'inactive': return 'Ngừng bán';
            case 'out_of_stock': return 'Hết hàng';
            default: return s || '';
        }
    }

    // ========== /admin/product/show.html ==========
    function prodList_getQueryParams() { const p = new URLSearchParams(location.search); return { page: parseInt(p.get('page') || '1') }; }
    function prodList_buildPageUrl(page) { const p = new URLSearchParams(location.search); p.set('page', page); return `/admin/product/show.html?${p.toString()}`; }
    async function prodList_load() {
        const { page } = prodList_getQueryParams();
        const token = localStorage.getItem('token');
        const q = new URLSearchParams({ page: String(page), limit: '10' });
        const res = await fetch(`/api/admin/products?${q.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const tbody = document.getElementById('productTableBody');
        const pager = document.getElementById('pagination');
        if (!res.ok || !json.success) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${json.message || 'Tải dữ liệu thất bại'}</td></tr>`;
            if (pager) pager.innerHTML = '';
            return;
        }
        const data = json.data || {}; const products = data.products || []; const pg = data.pagination || { currentPage: 1, totalPages: 1 };
        if (tbody) {
            if (!products.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có sản phẩm.</td></tr>';
            } else {
                tbody.innerHTML = products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${money(p.price)}</td>
                        <td>${vnCategory(p.category)}</td>
            <td>
                            <a class="btn btn-success btn-sm" href="/admin/product/detail.html?id=${p.id}">Xem</a>
                            <a class="btn btn-warning btn-sm mx-1" href="/admin/product/update.html?id=${p.id}">Cập nhật</a>
                            <a class="btn btn-danger btn-sm" href="/admin/product/delete.html?id=${p.id}">Xóa</a>
            </td>
          </tr>`).join('');
            }
        }
        if (pager) {
            const items = [];
            const disablePrev = pg.currentPage <= 1; const disableNext = pg.currentPage >= pg.totalPages;
            items.push(`<li class="page-item ${disablePrev ? 'disabled' : ''}"><a class="page-link" href="${prodList_buildPageUrl(pg.currentPage - 1)}">&laquo;</a></li>`);
            for (let i = 1; i <= pg.totalPages; i++) { items.push(`<li class="page-item ${i === pg.currentPage ? 'active' : ''}"><a class="page-link" href="${prodList_buildPageUrl(i)}">${i}</a></li>`); }
            items.push(`<li class="page-item ${disableNext ? 'disabled' : ''}"><a class="page-link" href="${prodList_buildPageUrl(pg.currentPage + 1)}">&raquo;</a></li>`);
            pager.innerHTML = items.join('');
        }
    }

    // ========== /admin/product/detail.html ==========
    async function prodDetail_load() {
        const id = getQueryParam('id'); if (!id) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        const info = document.getElementById('prodInfo');
        const img = document.getElementById('prodImg');
        const title = document.getElementById('title');
        if (!res.ok || !json.success) { if (info) info.innerHTML = `<li class="list-group-item text-danger">${json.message || 'Tải dữ liệu thất bại'}</li>`; return; }
        const p = json.data; if (title) title.textContent = `Chi tiết sản phẩm (id = ${p.id})`;
        if (p.image && img) {
            const url = p.image.startsWith('/') ? p.image : '/' + p.image;
            img.src = url; img.style.display = 'block';
        }
        if (info) info.innerHTML = `
            <li class="list-group-item"><strong>ID:</strong> ${p.id}</li>
            <li class="list-group-item"><strong>Tên:</strong> ${p.name || ''}</li>
            <li class="list-group-item"><strong>Giá:</strong> ${money(p.price)} đ</li>
            <li class="list-group-item"><strong>Danh mục:</strong> ${vnCategory(p.category)}</li>
            <li class="list-group-item"><strong>Số lượng:</strong> ${p.quantity ?? ''}</li>
            <li class="list-group-item"><strong>Loại thiết bị:</strong> ${vnMedicalDeviceType(p.medicalDeviceType)}</li>
            <li class="list-group-item"><strong>Thương hiệu:</strong> ${p.brand || 'Chưa có'}</li>
            <li class="list-group-item"><strong>Model:</strong> ${p.modelNumber || 'Chưa có'}</li>
            <li class="list-group-item"><strong>Bảo hành:</strong> ${p.warrantyPeriod ? p.warrantyPeriod + ' tháng' : 'Chưa có'}</li>
            <li class="list-group-item"><strong>Chứng nhận:</strong> ${p.certification || 'Chưa có'}</li>
            <li class="list-group-item"><strong>Trạng thái:</strong> ${vnStatus(p.status)}</li>
            <li class="list-group-item"><strong>Thông số kỹ thuật:</strong> ${p.specifications || 'Chưa có'}</li>
            <li class="list-group-item"><strong>Hướng dẫn sử dụng:</strong> ${p.usageInstructions || 'Chưa có'}</li>
            <li class="list-group-item"><strong>Mô tả:</strong> ${p.description || 'Chưa có'}</li>
        `;
    }

    // ========== /admin/product/create.html ==========
    function prodCreate_bindPreview() {
        const avatarFile = document.getElementById('avatarFile');
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarFile) {
            avatarFile.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) { const url = URL.createObjectURL(file); if (avatarPreview) { avatarPreview.src = url; avatarPreview.style.display = 'block'; } }
            });
        }
    }
    async function prodCreate_submit() {
        const name = document.getElementById('name').value.trim();
        const rawPrice = Number(document.getElementById('price').value || 0);
        const price = Math.max(0, Math.round(rawPrice));
        const quantity = document.getElementById('quantity').value ? Math.max(0, parseInt(document.getElementById('quantity').value, 10)) : 0;
        const detailDesc = document.getElementById('detailDesc').value.trim();
        const shortDesc = document.getElementById('shortDesc').value.trim();
        const category = document.getElementById('factory')?.value || '';
        // Thông tin thiết bị y tế
        const medicalDeviceType = document.getElementById('medicalDeviceType')?.value || '';
        const brand = document.getElementById('brand')?.value?.trim() || '';
        const modelNumber = document.getElementById('modelNumber')?.value?.trim() || '';
        const warrantyPeriod = document.getElementById('warrantyPeriod')?.value || '';
        const certification = document.getElementById('certification')?.value?.trim() || '';
        const status = document.getElementById('status')?.value || 'active';
        const specifications = document.getElementById('specifications')?.value?.trim() || '';
        const usageInstructions = document.getElementById('usageInstructions')?.value?.trim() || '';

        if (!name) { alert('Vui lòng nhập tên sản phẩm'); return; }
        if (!price || price <= 0) { alert('Giá sản phẩm phải > 0'); return; }
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('name', name);
        fd.append('price', String(price));
        fd.append('quantity', String(quantity));
        if (detailDesc || shortDesc) fd.append('description', detailDesc || shortDesc);
        if (category) fd.append('category', category);
        // Thêm thông tin thiết bị y tế
        if (medicalDeviceType) fd.append('medicalDeviceType', medicalDeviceType);
        if (brand) fd.append('brand', brand);
        if (modelNumber) fd.append('modelNumber', modelNumber);
        if (warrantyPeriod) fd.append('warrantyPeriod', warrantyPeriod);
        if (certification) fd.append('certification', certification);
        if (status) fd.append('status', status);
        if (specifications) fd.append('specifications', specifications);
        if (usageInstructions) fd.append('usageInstructions', usageInstructions);

        const file = document.getElementById('avatarFile')?.files?.[0];
        if (file) fd.append('image', file);
        const btn = document.getElementById('submitBtn'); btn.disabled = true;
        try {
            const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Tạo sản phẩm thất bại');
            alert('Tạo sản phẩm thành công'); location.href = '/admin/product/show.html';
        } catch (err) { alert(err.message || 'Có lỗi xảy ra'); } finally { btn.disabled = false; }
    }

    // ========== /admin/product/update.html ==========
    function prodUpdate_bindPreview() {
        const avatarFile = document.getElementById('avatarFile');
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarFile) {
            avatarFile.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) { const url = URL.createObjectURL(file); if (avatarPreview) { avatarPreview.src = url; avatarPreview.style.display = 'block'; } }
            });
        }
    }
    async function prodUpdate_load() {
        const id = getQueryParam('id');
        if (!id) { alert('Thiếu tham số id sản phẩm'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        if (!res.ok || !json.success) { alert(json.message || 'Không tải được sản phẩm'); return; }
        const p = json.data;
        document.getElementById('id').value = p.id;
        document.getElementById('name').value = p.name || '';
        document.getElementById('price').value = p.price ?? '';
        document.getElementById('detailDesc').value = p.description || '';
        document.getElementById('shortDesc').value = p.description || '';
        document.getElementById('quantity').value = p.quantity ?? 0;
        const factory = document.getElementById('factory');
        if (factory && p.category) {
            const mapToCode = (c) => {
                const v = String(c).toLowerCase();
                if (v === 'thiết bị đo y tế') return 'medical-measurement';
                if (v === 'thiết bị hỗ trợ hô hấp') return 'respiratory-support';
                if (v === 'vật tư y tế') return 'medical-supplies';
                if (v === 'chăm sóc sức khỏe') return 'health-care';
                if (v === 'thiết bị phục hồi chức năng') return 'rehabilitation-devices';
                return c;
            };
            const code = mapToCode(p.category);
            factory.value = code;
        }
        // Load thông tin thiết bị y tế
        const medicalDeviceType = document.getElementById('medicalDeviceType');
        if (medicalDeviceType && p.medicalDeviceType) medicalDeviceType.value = p.medicalDeviceType;
        const brand = document.getElementById('brand');
        if (brand) brand.value = p.brand || '';
        const modelNumber = document.getElementById('modelNumber');
        if (modelNumber) modelNumber.value = p.modelNumber || '';
        const warrantyPeriod = document.getElementById('warrantyPeriod');
        if (warrantyPeriod) warrantyPeriod.value = p.warrantyPeriod || '';
        const certification = document.getElementById('certification');
        if (certification) certification.value = p.certification || '';
        const statusEl = document.getElementById('status');
        if (statusEl && p.status) statusEl.value = p.status;
        const specifications = document.getElementById('specifications');
        if (specifications) specifications.value = p.specifications || '';
        const usageInstructions = document.getElementById('usageInstructions');
        if (usageInstructions) usageInstructions.value = p.usageInstructions || '';

        const pre = document.getElementById('avatarPreview'); if (p.image && pre) { const url = p.image.startsWith('/') ? p.image : '/' + p.image; pre.src = url; pre.style.display = 'block'; }
    }
    async function prodUpdate_submit() {
        const id = document.getElementById('id').value;
        const name = document.getElementById('name').value.trim();
        const rawPrice = Number(document.getElementById('price').value || 0);
        const price = Math.max(0, Math.round(rawPrice));
        const quantity = document.getElementById('quantity').value ? Math.max(0, parseInt(document.getElementById('quantity').value, 10)) : 0;
        const description = document.getElementById('detailDesc').value.trim() || document.getElementById('shortDesc').value.trim();
        const category = document.getElementById('factory')?.value || null;
        // Thông tin thiết bị y tế
        const medicalDeviceType = document.getElementById('medicalDeviceType')?.value || '';
        const brand = document.getElementById('brand')?.value?.trim() || '';
        const modelNumber = document.getElementById('modelNumber')?.value?.trim() || '';
        const warrantyPeriod = document.getElementById('warrantyPeriod')?.value || '';
        const certification = document.getElementById('certification')?.value?.trim() || '';
        const status = document.getElementById('status')?.value || 'active';
        const specifications = document.getElementById('specifications')?.value?.trim() || '';
        const usageInstructions = document.getElementById('usageInstructions')?.value?.trim() || '';

        if (!name) { alert('Vui lòng nhập tên sản phẩm'); return; }
        if (!price || price <= 0) { alert('Giá sản phẩm phải > 0'); return; }
        const fd = new FormData();
        fd.append('name', name);
        fd.append('price', String(price));
        fd.append('quantity', String(quantity));
        if (description) fd.append('description', description);
        if (category) fd.append('category', category);
        // Thêm thông tin thiết bị y tế
        fd.append('medicalDeviceType', medicalDeviceType);
        fd.append('brand', brand);
        fd.append('modelNumber', modelNumber);
        fd.append('warrantyPeriod', warrantyPeriod);
        fd.append('certification', certification);
        fd.append('status', status);
        fd.append('specifications', specifications);
        fd.append('usageInstructions', usageInstructions);

        const file = document.getElementById('avatarFile')?.files?.[0];
        if (file) fd.append('image', file);
        const btn = document.getElementById('updateBtn'); btn.disabled = true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            const json = await res.json(); if (!res.ok || !json.success) throw new Error(json.message || 'Cập nhật sản phẩm thất bại');
            alert('Cập nhật sản phẩm thành công'); location.href = '/admin/product/show.html';
        } catch (err) { alert(err.message || 'Có lỗi xảy ra'); } finally { btn.disabled = false; }
    }

    // ========== /admin/product/delete.html ==========
    function prodDelete_setMsg(html, type = 'info') { const el = document.getElementById('message'); if (el) el.innerHTML = `<div class="alert alert-${type}">${html}</div>`; }
    async function prodDelete_loadSummary() {
        const id = getQueryParam('id'); if (!id) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json(); const p = document.getElementById('prodSummary');
        if (!res.ok || !json.success) { if (p) p.textContent = json.message || 'Tải dữ liệu thất bại'; return; }
        const d = json.data; if (p) p.textContent = `#${d.id} — ${d.name} — ${d.price}`;
    }
    async function prodDelete_do() {
        const id = getQueryParam('id'); if (!id) return prodDelete_setMsg('Thiếu tham số id', 'danger');
        const btn = document.getElementById('confirmBtn'); btn.disabled = true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json(); if (!res.ok || !json.success) throw new Error(json.message || 'Xóa thất bại');
            prodDelete_setMsg('Xóa sản phẩm thành công. Đang chuyển...', 'success'); setTimeout(() => { location.href = '/admin/product/show.html'; }, 800);
        } catch (err) { prodDelete_setMsg(err.message || 'Có lỗi xảy ra', 'danger'); }
        finally { btn.disabled = false; }
    }

    // Router
    document.addEventListener('DOMContentLoaded', () => {
        if (path.endsWith('/admin/product/show.html')) {
            prodList_load().catch(() => { });
        } else if (path.endsWith('/admin/product/detail.html')) {
            prodDetail_load().catch(() => { });
        } else if (path.endsWith('/admin/product/create.html')) {
            prodCreate_bindPreview();
            document.getElementById('submitBtn')?.addEventListener('click', prodCreate_submit);
        } else if (path.endsWith('/admin/product/update.html')) {
            prodUpdate_bindPreview();
            prodUpdate_load().catch(() => { });
            document.getElementById('updateBtn')?.addEventListener('click', prodUpdate_submit);
        } else if (path.endsWith('/admin/product/delete.html')) {
            prodDelete_loadSummary().catch(() => { });
            document.getElementById('confirmBtn')?.addEventListener('click', prodDelete_do);
        }
    });
})();
