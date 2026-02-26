import { useState } from 'react';
import { getReports, getConflictReports } from '@/lib/storage';

export default function MapView() {
  const reports = getReports();
  const conflicts = getConflictReports().filter(c => c.status === 'Approved' || c.status === 'Escalated');
  const [filter, setFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Report dots
  const reportDots = reports.map(r => {
    const hash = r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      id: r.id, title: r.title, type: 'report' as const,
      riskLevel: r.riskLevel, severity: r.riskLevel === 'High' ? 'High' : 'Low',
      x: (hash * 7) % 80 + 10, y: (hash * 13) % 70 + 15,
      size: r.riskLevel === 'High' ? 20 : 12,
    };
  });

  // Conflict dots
  const conflictDots = conflicts.map(c => {
    const hash = c.id.split('').reduce((a, cc) => a + cc.charCodeAt(0), 0);
    return {
      id: c.id, title: `${c.conflictType}: ${c.location}`, type: 'conflict' as const,
      riskLevel: 'High' as const, severity: c.severity,
      x: (hash * 11) % 80 + 10, y: (hash * 17) % 70 + 15,
      size: c.severity === 'High' ? 24 : c.severity === 'Medium' ? 18 : 12,
    };
  });

  let allDots = [...reportDots, ...conflictDots];

  if (filter === 'reports') allDots = reportDots;
  if (filter === 'conflicts') allDots = conflictDots;
  if (filter !== 'all' && !['reports', 'conflicts'].includes(filter)) {
    allDots = conflictDots.filter(d => d.title.startsWith(filter));
  }
  if (riskFilter !== 'all') {
    allDots = allDots.filter(d => d.severity === riskFilter);
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'High') return { bg: 'hsl(var(--danger))', shadow: 'hsl(var(--danger) / 0.5)' };
    if (severity === 'Medium') return { bg: '#F59E0B', shadow: 'rgba(245,158,11,0.5)' };
    return { bg: 'hsl(var(--success))', shadow: 'hsl(var(--success) / 0.5)' };
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Map View</h1>
      <p className="text-muted-foreground mb-4">Simulated heatmap of reported issues and conflict hotspots.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-muted/50 focus:outline-none">
          <option value="all">All</option>
          <option value="reports">Reports Only</option>
          <option value="conflicts">Conflicts Only</option>
          <option value="Ethnic Tension">Ethnic Tension</option>
          <option value="Protest">Protest</option>
          <option value="Crime">Crime</option>
          <option value="Political Violence">Political Violence</option>
          <option value="Land Dispute">Land Dispute</option>
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-muted/50 focus:outline-none">
          <option value="all">All Severity</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="civic-card-flat relative overflow-hidden" style={{ height: 500 }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* City blocks */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[50%] left-[15%] w-[20%] h-[25%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[20%] left-[40%] w-[30%] h-[35%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[60%] left-[50%] w-[25%] h-[25%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[10%] left-[75%] w-[20%] h-[40%] rounded-xl border border-border/50 bg-muted/30" />
        </div>

        {/* Dots */}
        {allDots.map(d => {
          const colors = getSeverityColor(d.severity);
          return (
            <div
              key={d.id}
              className="absolute rounded-full transition-all group cursor-pointer"
              style={{
                left: `${d.x}%`, top: `${d.y}%`,
                width: d.size, height: d.size,
                backgroundColor: colors.bg,
                opacity: 0.7,
                boxShadow: `0 0 ${d.size}px ${colors.shadow}`,
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {d.type === 'conflict' ? '🔥 ' : ''}{d.title}
              </div>
            </div>
          );
        })}

        {allDots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No reports to display on map
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-3 border border-border text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span>High Risk / Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span>Low Risk / Severity</span>
          </div>
        </div>
      </div>

      {/* Conflict Hotspot Summary */}
      {conflicts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-3">Active Conflict Hotspots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {conflicts.map(c => (
              <div key={c.id} className={`civic-card py-4 ${c.status === 'Escalated' ? 'border-l-4 border-l-destructive' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.severity === 'High' ? 'risk-high' : c.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'risk-low'}`}>{c.severity}</span>
                  <span className="text-xs font-medium">{c.conflictType}</span>
                </div>
                <p className="text-sm font-semibold">{c.location}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
