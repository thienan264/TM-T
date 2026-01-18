(() => {
  const token = () => localStorage.getItem('token') || '';

  async function loadBanners() {
    const res = await fetch('/api/admin/banners', { headers: { 'Authorization': 'Bearer ' + token() } });
    const json = await res.json();
    const tbody = document.getElementById('bannerTableBody');
    if (!res.ok || !json.success) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">' + (json.message || 'Tải banner thất bại') + '</td></tr>';
      return;
    }
    const rows = (json.data?.banners) || json.data || [];
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">Chưa có banner.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(b => {
      const img = b.image ? ('/' + String(b.image).replace(/^\//, '')) : '';
      const status = b.isActive ? '<span class="badge bg-success">Kích hoạt</span>' : '<span class="badge bg-secondary">Tắt</span>';
      return '<tr>' +
        '<td>' + b.id + '</td>' +
        '<td>' + (b.title || '') + '</td>' +
        '<td>' + (img ? ('<img src="' + img + '" style="height:40px" />') : '') + '</td>' +
        '<td>' + (b.link || '') + '</td>' +
        '<td>' + (b.position || '') + '</td>' +
        '<td>' + (b.order || 0) + '</td>' +
        '<td>' + status + '</td>' +
        '<td>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteBanner(' + b.id + ')">Xóa</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  async function createBanner() {
    const form = new FormData();
    const title = document.getElementById('title').value.trim();
    const link = document.getElementById('link').value.trim();
    const position = document.getElementById('position').value;
    const order = document.getElementById('order').value || '0';
    const imageInput = document.getElementById('image');
    if (!imageInput.files.length) { alert('Chọn ảnh banner'); return; }
    form.append('title', title);
    form.append('link', link);
    form.append('position', position);
    form.append('order', order);
    form.append('image', imageInput.files[0]);
    const btn = document.getElementById('createBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/banners', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token() }, body: form });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Tạo thất bại');
      alert('Tạo banner thành công');
      await loadBanners();
    } catch (e) { alert(e.message || 'Có lỗi'); } finally { btn.disabled = false; }
  }

  window.deleteBanner = async function(id) {
    if (!confirm('Xóa banner?')) return;
    const res = await fetch('/api/admin/banners/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token() } });
    const json = await res.json();
    if (!res.ok || !json.success) { alert(json.message || 'Xóa thất bại'); return; }
    await loadBanners();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname.endsWith('/admin/banner/show.html')) {
      document.getElementById('createBtn')?.addEventListener('click', createBanner);
      loadBanners();
    }
  });
})();
