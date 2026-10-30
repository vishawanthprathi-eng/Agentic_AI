import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const STATUS_COLORS = {
  Verified: '#10B981', // Emerald
  Bugged: '#EF4444',   // Rose
  Pending: '#F59E0B'   // Amber
};

export function StatusDistributionChart({ data }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Verified', value: 0, color: '#10B981' },
    { name: 'Bugged', value: 0, color: '#EF4444' },
    { name: 'Pending', value: 0, color: '#F59E0B' }
  ];

  const total = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      {total === 0 ? (
        <div className="text-slate-400 text-sm flex flex-col items-center justify-center h-full">
          <span>No code uploads recorded yet</span>
          <span className="text-xs text-slate-500 mt-1">Upload code to populate AI analysis distribution</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || STATUS_COLORS[entry.name] || '#6366F1'} 
                  stroke="#111827" 
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC'
              }}
              formatter={(value, name) => [`${value} files (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function MemberContributionChart({ data }) {
  const chartData = data && data.length > 0 ? data : [];

  return (
    <div className="w-full h-64">
      {chartData.length === 0 ? (
        <div className="text-slate-400 text-sm flex flex-col items-center justify-center h-full">
          <span>No team member activity recorded</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis 
              dataKey="email" 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val) => val.split('@')[0]}
            />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC'
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px' }} />
            <Bar dataKey="verifiedCount" name="Verified Code" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="buggedCount" name="Bugged / Issues" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default {
  StatusDistributionChart,
  MemberContributionChart
};
