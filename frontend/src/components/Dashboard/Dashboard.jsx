import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [filter, setFilter] = useState({ timeframe: 'month', position: 'all' });
  const [metrics, setMetrics] = useState({ resumes: 0, shortlisted: 0, interviews: 0, closures: 0 });
  const [chartData, setChartData] = useState({ funnel: null, performance: null });
  const [insights, setInsights] = useState([]);
  const [rawEntries, setRawEntries] = useState([]);

  useEffect(() => {
    fetchMetrics();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_entries'
        },
        () => {
          console.log('Real-time update detected!');
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchMetrics = async () => {
    let query = supabase.from('daily_entries').select('*, profiles(name)');
    if (filter.position !== 'all') {
      query = query.eq('position', filter.position);
    }
    
    const { data: entries, error } = await query;
    if (error || !entries) return;

    const totals = { resumes: 0, shortlisted: 0, interviews: 0, offers: 0, closures: 0 };
    const userStats = {};

    entries.forEach(e => {
      totals.resumes += e.resumes;
      totals.shortlisted += e.shortlisted;
      totals.interviews += e.interviews_completed;
      totals.offers += e.offers;
      totals.closures += e.closures;
      
      const userId = e.user_id;
      if (!userStats[userId]) {
        userStats[userId] = { name: e.profiles?.name || 'Unknown', closures: 0 };
      }
      userStats[userId].closures += e.closures;
    });

    setMetrics(totals);
    setRawEntries(entries);
    processCharts(totals, userStats);
    generateInsights(totals);
  };

  const processCharts = (totals, userStats) => {
    setChartData({
      funnel: {
        labels: ['Resumes', 'Shortlisted', 'Interviews', 'Offers', 'Closures'],
        datasets: [{
          label: 'Count',
          data: [totals.resumes, totals.shortlisted, totals.interviews, totals.offers, totals.closures],
          backgroundColor: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'],
          borderRadius: 6
        }]
      },
      performance: {
        labels: Object.values(userStats).map(s => s.name.split(' ')[0]),
        datasets: [{
          label: 'Closures',
          data: Object.values(userStats).map(s => s.closures),
          backgroundColor: '#10b981',
          borderRadius: 4
        }]
      }
    });
  };

  const generateInsights = (totals) => {
    const newInsights = [];
    if (totals.resumes === 0) return;
    
    const intRatio = (totals.interviews / totals.shortlisted) * 100 || 0;
    const closeRatio = (totals.closures / totals.interviews) * 100 || 0;
    
    if (closeRatio < 10 && totals.interviews > 0) {
      newInsights.push({ type: 'danger', icon: 'warning', text: `Low Closure Rate! Only ${closeRatio.toFixed(1)}% of interviews result in joins.` });
    }
    if (intRatio < 30 && totals.shortlisted > 0) {
      newInsights.push({ type: 'warning', icon: 'error_outline', text: `Drop at Interview Stage: Many shortlisted are not interviewed (${intRatio.toFixed(1)}%).` });
    }
    if (totals.closures > 0 && closeRatio > 25) {
      newInsights.push({ type: 'success', icon: 'check_circle', text: `Great Performance: High closure rate (${closeRatio.toFixed(1)}%).` });
    }
    setInsights(newInsights);
  };

  return (
    <div className="section-view">
      <div className="filters-bar">
        <div className="filter-group">
          <label>Timeframe</label>
          <select value={filter.timeframe} onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Position</label>
          <select value={filter.position} onChange={(e) => setFilter({ ...filter, position: e.target.value })}>
            <option value="all">All Positions</option>
            <option value="PPC">PPC</option>
            <option value="SEO">SEO</option>
            <option value="Sales">Sales</option>
            <option value="BDE">BDE</option>
            <option value="IT">IT Support</option>
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon="description" color="blue" label="Total Resumes" value={metrics.resumes} />
        <KpiCard icon="fact_check" color="yellow" label="Shortlisted" value={metrics.shortlisted} />
        <KpiCard icon="people" color="purple" label="Interviews" value={metrics.interviews} />
        <KpiCard icon="handshake" color="green" label="Closures" value={metrics.closures} />
      </div>

      <div className="insights-panel">
        {insights.map((insight, i) => (
          <div key={i} className={`insight-alert ${insight.type}`}>
            <span className="material-icons-round">{insight.icon}</span>
            <div>{insight.text}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Conversion Funnel</h3>
          <div className="chart-container">
            {chartData.funnel && <Bar data={chartData.funnel} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
          </div>
        </div>
        <div className="chart-card">
          <h3>Recruiter Performance</h3>
          <div className="chart-container">
            {chartData.performance && <Bar data={chartData.performance} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="section-header">
          <h3>Detailed Activity Log</h3>
          <p>Full history of recruiter submissions</p>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recruiter</th>
                <th>Position</th>
                <th>Resumes</th>
                <th>Shortlisted</th>
                <th>Interviews</th>
                <th>Offers</th>
                <th>Closures</th>
              </tr>
            </thead>
            <tbody>
              {rawEntries.length > 0 ? (
                rawEntries.map((e, i) => (
                  <tr key={i}>
                    <td>{e.entry_date}</td>
                    <td><strong>{e.profiles?.name || 'Unknown'}</strong></td>
                    <td>{e.position}</td>
                    <td>{e.resumes}</td>
                    <td>{e.shortlisted}</td>
                    <td>{e.interviews_completed}</td>
                    <td>{e.offers}</td>
                    <td><span className="text-success font-bold">{e.closures}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center">No data available for the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, color, label, value }) => (
  <div className="kpi-card">
    <div className={`kpi-icon ${color}`}><span className="material-icons-round">{icon}</span></div>
    <div className="kpi-info">
      <h3>{label}</h3>
      <div className="kpi-value">{value}</div>
    </div>
  </div>
);

export default Dashboard;
