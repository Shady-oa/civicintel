import { getReports, getProjects, getProjectFeedback, getProjectExpenses, getConflictReports } from '@/lib/storage';
import { FileText, AlertTriangle, CheckCircle, TrendingUp, Building2, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import { calculateTransparencyIndex } from '@/lib/ai-simulation';

export default function AdminDashboard() {
  const reports = getReports();
  const projects = getProjects();
  const allFeedback = getProjectFeedback();
  const allExpenses = getProjectExpenses();
  const conflicts = getConflictReports();

  const total = reports.length;
  const highRisk = reports.filter(r => r.riskLevel === 'High').length;
  const solved = reports.filter(r => r.status === 'Solved').length;
  const responseRate = total > 0 ? Math.round((reports.filter(r => r.status !== 'Pending').length / total) * 100) : 0;
  const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Transparency Index
  const avgRating = allFeedback.length > 0 ? allFeedback.reduce((s, f) => s + f.rating, 0) / allFeedback.length : 3;
  const transparencyIndex = calculateTransparencyIndex(reports, projects, avgRating);
  const transparencyColor = transparencyIndex > 75 ? 'text-success' : transparencyIndex > 50 ? 'text-amber-500' : 'text-danger';

  // Corruption risk indicators
  const budgetOverruns = projects.filter(p => p.fundsSpent > p.totalBudget).length;
  const negativeProjects = projects.filter(p => {
    const fb = allFeedback.filter(f => f.projectId === p.id);
    const avg = fb.length > 0 ? fb.reduce((s, f) => s + f.rating, 0) / fb.length : 5;
    return avg < 2.5;
  }).length;
  const highConflictAreas = conflicts.filter(c => c.severity === 'High').length;
  const corruptionRisk = budgetOverruns + negativeProjects + (highConflictAreas > 3 ? 1 : 0);

  const stats = [
    { label: 'Total Reports', value: total, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'bg-danger-light text-danger' },
    { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: CheckCircle, color: 'bg-success-light text-success' },
  ];

  const catMap: Record<string, number> = {};
  reports.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + 1; });
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const deptMap: Record<string, { total: number; resolved: number }> = {};
  reports.forEach(r => {
    if (!deptMap[r.suggestedDepartment]) deptMap[r.suggestedDepartment] = { total: 0, resolved: 0 };
    deptMap[r.suggestedDepartment].total++;
    if (r.status === 'Solved') deptMap[r.suggestedDepartment].resolved++;
  });
  const deptData = Object.entries(deptMap).map(([name, d]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    rate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0,
  }));

  const statusData = [
    { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length },
    { name: 'In Progress', value: reports.filter(r => r.status === 'In Progress').length },
    { name: 'Solved', value: solved },
  ].filter(d => d.value > 0);

  const COLORS = ['hsl(152,61%,31%)', 'hsl(0,66%,47%)', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316'];
  const STATUS_COLORS = ['#F59E0B', '#6366F1', 'hsl(152,61%,31%)'];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all civic reports and performance metrics.</p>
      </div>

      {/* Corruption Risk Banner */}
      {corruptionRisk > 0 && (
        <div className="bg-danger-light border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-danger shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">⚠ Corruption Risk Detected</p>
            <p className="text-xs text-danger/80">{budgetOverruns} budget overruns · {negativeProjects} poorly rated projects · {highConflictAreas} high-severity conflicts</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Transparency Index + Project Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="civic-card-flat text-center">
          <h3 className="font-semibold mb-2">Governance Transparency</h3>
          <p className={`text-5xl font-bold ${transparencyColor}`}>{transparencyIndex}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${transparencyIndex}%`,
              backgroundColor: transparencyIndex > 75 ? 'hsl(var(--success))' : transparencyIndex > 50 ? '#F59E0B' : 'hsl(var(--danger))'
            }} />
          </div>
        </div>
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Projects</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span className="font-semibold">{projects.filter(p => p.status === 'Ongoing').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delayed</span><span className="font-semibold text-danger">{projects.filter(p => p.status === 'Delayed').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Budget Overruns</span><span className="font-semibold text-danger">{budgetOverruns}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Budget</span><span className="font-semibold">KES {(projects.reduce((s, p) => s + p.totalBudget, 0) / 1000000).toFixed(1)}M</span></div>
          </div>
        </div>
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Conflict Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Pending Approval</span><span className="font-semibold">{conflicts.filter(c => c.status === 'Pending').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Active Hotspots</span><span className="font-semibold text-danger">{conflicts.filter(c => c.status === 'Approved').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Escalated</span><span className="font-semibold text-danger">{conflicts.filter(c => c.status === 'Escalated').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">High Severity</span><span className="font-semibold text-danger">{highConflictAreas}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-4">Reports by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">No data yet</p>
          )}
        </div>

        <div className="civic-card-flat">
          <h3 className="font-semibold mb-4">Department Resolution Rate</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
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

      {statusData.length > 0 && (
        <div className="civic-card-flat">
          <h3 className="font-semibold mb-4">Report Status Overview</h3>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[i] }} />
                  <span className="text-sm flex-1">{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / total) * 100}%`, backgroundColor: STATUS_COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
