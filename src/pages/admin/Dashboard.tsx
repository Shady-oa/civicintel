import { getReports } from '@/lib/storage';
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const reports = getReports();
  const total = reports.length;
  const highRisk = reports.filter(r => r.riskLevel === 'High').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const responseRate = total > 0 ? Math.round((reports.filter(r => r.status !== 'Pending').length / total) * 100) : 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { label: 'Total Reports', value: total, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'bg-danger-light text-danger' },
    { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: CheckCircle, color: 'bg-success-light text-success' },
  ];

  // Category breakdown
  const catMap: Record<string, number> = {};
  reports.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + 1; });
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Department performance
  const deptMap: Record<string, { total: number; resolved: number }> = {};
  reports.forEach(r => {
    if (!deptMap[r.suggestedDepartment]) deptMap[r.suggestedDepartment] = { total: 0, resolved: 0 };
    deptMap[r.suggestedDepartment].total++;
    if (r.status === 'Resolved') deptMap[r.suggestedDepartment].resolved++;
  });
  const deptData = Object.entries(deptMap).map(([name, d]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    rate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0,
  }));

  const COLORS = ['hsl(152,61%,31%)', 'hsl(0,66%,47%)', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316'];

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="civic-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-4">Reports by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">No data yet</p>
          )}
        </div>

        {/* Department Performance */}
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-4">Department Resolution Rate</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                  {deptData.map((d, i) => (
                    <Cell key={i} fill={d.rate >= 50 ? 'hsl(152,61%,31%)' : 'hsl(0,66%,47%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
