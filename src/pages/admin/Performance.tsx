import { getReports } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Performance() {
  const reports = getReports();

  const deptMap: Record<string, { total: number; resolved: number; avgRisk: number }> = {};
  reports.forEach(r => {
    if (!deptMap[r.suggestedDepartment]) deptMap[r.suggestedDepartment] = { total: 0, resolved: 0, avgRisk: 0 };
    deptMap[r.suggestedDepartment].total++;
    deptMap[r.suggestedDepartment].avgRisk += r.riskScore;
    if (r.status === 'Solved') deptMap[r.suggestedDepartment].resolved++;
  });

  const data = Object.entries(deptMap).map(([name, d]) => ({
    name: name.length > 15 ? name.slice(0, 15) + '…' : name,
    resolution: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0,
    avgRisk: d.total > 0 ? Math.round(d.avgRisk / d.total) : 0,
    total: d.total,
  }));

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Performance Scorecard</h1>

      {data.length === 0 ? (
        <div className="civic-card-flat text-center text-muted-foreground py-12">No data available yet</div>
      ) : (
        <>
          <div className="civic-card-flat">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Department Resolution Rates
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="resolution" radius={[8, 8, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.resolution >= 50 ? 'hsl(152,61%,31%)' : 'hsl(0,66%,47%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(d => (
              <div key={d.name} className="civic-card">
                <p className="font-semibold text-sm">{d.name}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reports</span>
                    <span className="font-medium">{d.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className={`font-semibold ${d.resolution >= 50 ? 'text-success' : 'text-danger'}`}>{d.resolution}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Risk</span>
                    <span className={`font-semibold ${d.avgRisk > 70 ? 'text-danger' : 'text-success'}`}>{d.avgRisk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
