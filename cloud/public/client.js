let chartSev = null;
let chartEco = null;

function initCharts() {
  const ctxSev = document.getElementById('chart-severity').getContext('2d');
  const ctxEco = document.getElementById('chart-ecosystem').getContext('2d');

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = '#334155';

  chartSev = new Chart(ctxSev, {
    type: 'doughnut',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#94a3b8'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Vulnerability Severity' }
      }
    }
  });

  chartEco = new Chart(ctxEco, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Alerts per Ecosystem',
        data: [],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#334155' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Vulnerabilities by Ecosystem' }
      }
    }
  });
}

async function refresh() {
  try {
    const [alertsRes, machinesRes] = await Promise.all([
      fetch("/alerts"),
      fetch("/machines")
    ]);

    const alertsJson = await alertsRes.json();
    const machinesJson = await machinesRes.json();

    const alerts = alertsJson.alerts || [];
    const machines = machinesJson.machines || [];

    // Update Stats
    document.getElementById("stat-machines").innerText = machines.length;
    document.getElementById("stat-alerts").innerText = alerts.length;
    document.getElementById("stat-critical").innerText = alerts.filter(a => a.severity === "critical").length;

    // Update Charts
    if (chartSev && chartEco) {
      const counts = { critical: 0, high: 0, medium: 0, low: 0 };
      const ecoCounts = {};
      
      alerts.forEach(a => {
        const s = (a.severity || "low").toLowerCase();
        if (counts[s] !== undefined) counts[s]++;
        
        const eco = a.package?.ecosystem || "Unknown";
        ecoCounts[eco] = (ecoCounts[eco] || 0) + 1;
      });

      chartSev.data.datasets[0].data = [counts.critical, counts.high, counts.medium, counts.low];
      chartSev.update();

      chartEco.data.labels = Object.keys(ecoCounts);
      chartEco.data.datasets[0].data = Object.values(ecoCounts);
      chartEco.update();
    }

    // Update Alerts Table
    const tbodyA = document.querySelector("#alerts tbody");
    if (alerts.length === 0) {
      tbodyA.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary);">No active alerts</td></tr>`;
    } else {
      tbodyA.innerHTML = alerts.map(a => {
        const sevClass = `badge badge-${a.severity || "low"}`;
        return `<tr>
          <td><span class="${sevClass}">${a.severity}</span></td>
          <td><span class="code">${a.package?.ecosystem || ""}:${a.package?.name || ""}@${a.package?.version || ""}</span></td>
          <td>${a.cve_id || ""}</td>
          <td><span class="code" title="${a.machine_id}">${a.machine_id.slice(0, 8)}...</span></td>
          <td>${a.fix || "-"}</td>
          <td>${new Date(a.created_at).toLocaleString()}</td>
        </tr>`;
      }).join("");
    }

    // Update Machines Table
    const tbodyM = document.querySelector("#machines tbody");
    if (machines.length === 0) {
      tbodyM.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary);">No machines registered</td></tr>`;
    } else {
      tbodyM.innerHTML = machines.map(m => {
        const lastSeen = new Date(m.last_seen);
        const now = new Date();
        const diff = (now - lastSeen) / 1000;
        const isOnline = diff < 65; // 60s heartbeat + buffer
        const statusClass = isOnline ? "status-online" : "status-offline";
        const statusText = isOnline ? "Online" : "Offline";

        return `<tr>
          <td class="${statusClass}">● ${statusText}</td>
          <td><span class="code">${m.uuid}</span></td>
          <td>${m.hostname}</td>
          <td>${m.os}</td>
          <td>${lastSeen.toLocaleString()}</td>
        </tr>`;
      }).join("");
    }
  } catch (err) {
    console.error("Failed to refresh dashboard:", err);
  }
}

async function init() {
  initCharts();
  refresh();
  setInterval(refresh, 5000);
}

init();
