import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart,
} from 'recharts';
import api from '../api/axios';

const STATUS_COLORS = {
  booked: '#C9A05C',      // gold
  shipped: '#3B82F6',     // blue
  active: '#234D3B',      // deep emerald
  returned: '#A78BFA',    // violet
  overdue: '#EF4444',     // red
  completed: '#10B981',   // bright emerald/green
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
    api.get('/admin/dashboard/charts').then((res) => setCharts(res.data));
  }, []);

  if (!stats || !charts) return <p className="text-muted">Loading...</p>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#3B82F6' },
    { label: 'Pending KYC', value: stats.pendingKyc, color: '#C9A05C' },
    { label: 'Verified KYC', value: stats.verifiedKyc, color: '#10B981' },
    { label: 'Total Revenue', value: `₹${charts.totalRevenue}`, color: '#234D3B' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-ink/10 rounded-2xl p-6 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: c.color }}
            />
            <p className="text-muted text-sm mb-1">{c.label}</p>
            <p className="font-display text-3xl" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue trend — area chart with gradient */}
        <div className="col-span-2 bg-white border border-ink/10 rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4">Revenue — last 7 days</h3>
          {charts.revenueTrend.length === 0 ? (
            <p className="text-muted text-sm">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234D3B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#234D3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1F10" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A8680' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8A8680' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #1B1B1F1A', fontSize: 13 }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#234D3B"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#C9A05C', stroke: '#234D3B', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

       {/* Orders by status — colorful donut with center label */}
<div className="bg-white border border-ink/10 rounded-2xl p-6">
  <h3 className="font-display text-lg mb-4">Orders by status</h3>
  {charts.ordersByStatus.length === 0 ? (
    <p className="text-muted text-sm">No orders yet.</p>
  ) : (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <linearGradient key={status} id={`grad-${status}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={charts.ordersByStatus}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={5}
            stroke="#F7F5F1"
            strokeWidth={3}
            label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {charts.ordersByStatus.map((entry, i) => (
              <Cell key={i} fill={`url(#grad-${entry.status})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #1B1B1F1A', fontSize: 13 }}
            formatter={(value, name) => [`${value} orders`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center overlay — total orders */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-20px' }}>
        <p className="font-display text-3xl">
          {charts.ordersByStatus.reduce((sum, o) => sum + o.count, 0)}
        </p>
        <p className="text-muted text-xs">Total orders</p>
      </div>
    </div>
  )}

  {/* Custom legend below chart */}
  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
    {charts.ordersByStatus.map((entry) => (
      <div key={entry.status} className="flex items-center gap-1.5 text-xs">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: STATUS_COLORS[entry.status] || '#8A8680' }}
        />
        <span className="capitalize text-muted">{entry.status}</span>
        <span className="font-mono font-medium">{entry.count}</span>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}
