(() => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const alertEl = document.getElementById('alert');
    const submitBtn = document.getElementById('submitBtn');

    function showAlert(type, message) {
        if (!alertEl) return;
        alertEl.className = 'alert ' + (type === 'error' ? 'error' : 'success');
        alertEl.textContent = message;
        alertEl.style.display = 'block';
    }

    function isAdminUser(user) {
        if (!user) return false;
        // Common shapes: user.role === 'admin' OR user.role.name === 'admin' OR user.roles includes 'admin'
        const normalize = (v) => typeof v === 'string' ? v.toLowerCase() : (v && typeof v.name === 'string' ? v.name.toLowerCase() : undefined);

        const direct = normalize(user.role);
        if (direct === 'admin') return true;

        if (Array.isArray(user.roles)) {
            return user.roles.some((r) => normalize(r) === 'admin');
        }
        return false;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (alertEl) alertEl.style.display = 'none';
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            email: form.email.value.trim(),
            password: form.password.value
        };

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            const user = data?.data?.user;
            if (!isAdminUser(user)) {
                showAlert('error', 'Bạn không có quyền truy cập trang quản trị.');
                // Xóa mọi thông tin nếu có
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => { window.location.href = '/auth/deny.html'; }, 600);
                return;
            }

            // Lưu token và chuyển hướng dashboard admin
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            showAlert('success', 'Đăng nhập thành công. Đang chuyển hướng...');
            setTimeout(() => { window.location.href = '/admin/dashboard/show.html'; }, 500);
        } catch (err) {
            showAlert('error', err.message);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
})();
