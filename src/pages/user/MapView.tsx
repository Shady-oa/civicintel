import { getReports } from '@/lib/storage';

export default function MapView() {
  const reports = getReports();

  // Generate pseudo-random positions based on report id
  const dots = reports.map(r => {
    const hash = r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      id: r.id,
      title: r.title,
      riskLevel: r.riskLevel,
      x: (hash * 7) % 80 + 10,
      y: (hash * 13) % 70 + 15,
      size: r.riskLevel === 'High' ? 20 : 12,
    };
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Map View</h1>
      <p className="text-muted-foreground mb-4">Simulated heatmap of reported issues across the city.</p>

      <div className="civic-card-flat relative overflow-hidden" style={{ height: 500 }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* City blocks simulation */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[50%] left-[15%] w-[20%] h-[25%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[20%] left-[40%] w-[30%] h-[35%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[60%] left-[50%] w-[25%] h-[25%] rounded-xl border border-border/50 bg-muted/30" />
          <div className="absolute top-[10%] left-[75%] w-[20%] h-[40%] rounded-xl border border-border/50 bg-muted/30" />
        </div>

        {/* Dots */}
        {dots.map(d => (
          <div
            key={d.id}
            className="absolute rounded-full transition-all group cursor-pointer"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              backgroundColor: d.riskLevel === 'High' ? 'hsl(var(--danger))' : 'hsl(var(--success))',
              opacity: 0.7,
              boxShadow: `0 0 ${d.size}px ${d.riskLevel === 'High' ? 'hsl(var(--danger) / 0.5)' : 'hsl(var(--success) / 0.5)'}`,
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {d.title}
            </div>
          </div>
        ))}

        {dots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No reports to display on map
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-3 border border-border text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span>Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
