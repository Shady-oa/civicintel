import { getReports } from '@/lib/storage';
import { AlertTriangle, Shield } from 'lucide-react';

export default function RiskMonitoring() {
  const reports = getReports();
  const highRisk = reports.filter(r => r.riskLevel === 'High').sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Risk Monitoring</h1>

      {highRisk.length > 0 && (
        <div className="bg-danger-light border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">
            {highRisk.length} high-risk {highRisk.length === 1 ? 'report' : 'reports'} require immediate attention.
          </p>
        </div>
      )}

      {/* Hotspot Zones */}
      <div className="civic-card-flat">
        <h3 className="font-semibold mb-4">Simulated Hotspot Zones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Downtown', 'East District', 'Industrial Zone', 'Residential Area', 'Market District', 'Port Area', 'Central Park', 'Tech Hub'].map((zone, i) => {
            const zoneRisk = (i * 17 + highRisk.length * 11) % 100;
            const isHot = zoneRisk > 60;
            return (
              <div key={zone} className={`rounded-xl p-4 text-center ${isHot ? 'bg-danger-light border border-destructive/20' : 'bg-success-light border border-success/20'}`}>
                <Shield className={`w-6 h-6 mx-auto mb-2 ${isHot ? 'text-danger' : 'text-success'}`} />
                <p className="text-sm font-medium">{zone}</p>
                <p className={`text-xs font-bold mt-1 ${isHot ? 'text-danger' : 'text-success'}`}>
                  Risk: {zoneRisk}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* High Risk Reports */}
      <div>
        <h3 className="font-semibold mb-3">High Risk Reports</h3>
        {highRisk.length === 0 ? (
          <div className="civic-card-flat text-center text-muted-foreground py-8">No high-risk reports</div>
        ) : (
          <div className="space-y-3">
            {highRisk.map(r => (
              <div key={r.id} className="civic-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center shrink-0">
                  <span className="text-danger font-bold text-lg">{r.riskScore}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.category} · {r.username} · {r.status}</p>
                </div>
                <span className="text-xs risk-high px-2.5 py-1 rounded-full shrink-0">{r.sentiment}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
