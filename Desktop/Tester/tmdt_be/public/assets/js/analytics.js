(() => {
    function money(n) {
        try { return Number(n).toLocaleString('vi-VN') + ' d'; }
        catch { return n + ' d'; }
    }

    let revenueChart = null;
    let orderStatusChart = null;
    let newCustomersChart = null;

    async function loadOverview() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/analytics/overview', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            const d = json.data;
            document.getElementById('totalRevenue').textContent = money(d.totalRevenue);
            document.getElementById('totalProductsSold').textContent = d.totalProductsSold;
            document.getElementById('totalOrders').textContent = d.totalOrders;
            document.getElementById('totalCustomers').textContent = d.totalCustomers;
        } catch (err) {
            console.error('Load overview error:', err);
        }
    }

    async function loadRevenueChart() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/analytics/revenue-by-month', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            const data = json.data;
            const labels = data.map(d => d.label);
            const revenues = data.map(d => d.revenue);

            const ctx = document.getElementById('revenueChart').getContext('2d');
            if (revenueChart) revenueChart.destroy();

            revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh thu (VND)',
                        data: revenues,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('vi-VN');
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Load revenue chart error:', err);
        }
    }

    async function loadOrderStatusChart() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/analytics/orders-by-status', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            const data = json.data;
            const labels = data.map(d => d.label);
            const counts = data.map(d => d.count);
            const colors = ['#ffc107', '#17a2b8', '#28a745', '#dc3545'];

            const ctx = document.getElementById('orderStatusChart').getContext('2d');
            if (orderStatusChart) orderStatusChart.destroy();

            orderStatusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Load order status chart error:', err);
        }
    }

    async function loadTopProducts() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/analytics/top-products?limit=10', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            const data = json.data;
            const tbody = document.getElementById('topProductsBody');

            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chua co du lieu</td></tr>';
                return;
            }

            tbody.innerHTML = data.map((item, idx) => {
                const p = item.product || {};
                return '<tr>' +
                    '<td>' + (idx + 1) + '</td>' +
                    '<td>' + (p.name || 'N/A') + '</td>' +
                    '<td>' + item.totalSold + '</td>' +
                    '<td>' + money(item.totalRevenue) + '</td>' +
                    '</tr>';
            }).join('');
        } catch (err) {
            console.error('Load top products error:', err);
            document.getElementById('topProductsBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger">Loi tai du lieu</td></tr>';
        }
    }

    async function loadNewCustomersChart() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/analytics/new-customers', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            const data = json.data;
            const labels = data.map(d => d.label);
            const counts = data.map(d => d.count);

            const ctx = document.getElementById('newCustomersChart').getContext('2d');
            if (newCustomersChart) newCustomersChart.destroy();

            newCustomersChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Khach hang moi',
                        data: counts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Load new customers chart error:', err);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (location.pathname.endsWith('/admin/analytics/show.html')) {
            loadOverview();
            loadRevenueChart();
            loadOrderStatusChart();
            loadTopProducts();
            loadNewCustomersChart();
        }
    });
})();

