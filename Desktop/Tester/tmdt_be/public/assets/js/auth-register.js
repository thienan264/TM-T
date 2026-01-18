(() => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const alertEl = document.getElementById('alert');
    const submitBtn = document.getElementById('submitBtn');

    function showAlert(type, message) {
        if (!alertEl) return;
        alertEl.className = 'alert ' + (type === 'error' ? 'error' : 'success');
        alertEl.textContent = message;
        alertEl.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (alertEl) alertEl.style.display = 'none';
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }
            // Đăng ký thành công -> chuyển tới trang đăng nhập
            showAlert('success', 'Đăng ký thành công. Vui lòng đăng nhập.');
            setTimeout(() => { window.location.href = '/auth/login.html'; }, 500);
        } catch (err) {
            showAlert('error', err.message);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
})();
