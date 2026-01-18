(() => {
    async function fetchCount(url) {
        try {
            const token = localStorage.getItem('token');
            const sep = url.includes('?') ? '&' : '?';
            const res = await fetch(`${url}${sep}limit=1`, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            if (!res.ok || !json.success) return null;
            return json.data?.pagination?.totalItems ?? null;
        } catch { return null; }
    }
    document.addEventListener('DOMContentLoaded', async () => {
        const [u, p, o] = await Promise.all([
            fetchCount('/api/admin/users'),
            fetchCount('/api/admin/products'),
            fetchCount('/api/admin/orders'),
        ]);
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val ?? '0'); };
        set('countUsers', u);
        set('countProducts', p);
        set('countOrders', o);
    });
})();
