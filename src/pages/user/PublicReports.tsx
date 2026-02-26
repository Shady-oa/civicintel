import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getReports, updateReport } from '@/lib/storage';
import { Report, ReportComment } from '@/lib/types';
import { ThumbsUp, MessageCircle, Share2, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicReports() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const allReports = getReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const categories = ['All', ...new Set(allReports.map(r => r.category))];
  const reports = filterCategory === 'All' ? allReports : allReports.filter(r => r.category === filterCategory);

  const likeReport = (id: string) => {
    const r = getReports().find(x => x.id === id);
    if (!r) return;
    updateReport(id, { likes: (r.likes || 0) + 1 });
    setRefreshKey(k => k + 1);
  };

  const addComment = (id: string) => {
    if (!commentInput.trim()) return;
    const r = getReports().find(x => x.id === id);
    if (!r) return;
    const newComment: ReportComment = {
      id: `comment-${Date.now()}`, userId: session!.id, username: session!.username,
      message: commentInput, timestamp: new Date().toISOString(),
    };
    updateReport(id, { comments: [...(r.comments || []), newComment] });
    setCommentInput('');
    setSelectedReport({ ...r, comments: [...(r.comments || []), newComment] });
    setRefreshKey(k => k + 1);
  };

  const shareReport = (title: string) => {
    toast.success(`Share link copied for "${title}"`);
  };

  const statusIcon = (status: string) => {
    if (status === 'Solved') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'In Progress') return <Clock className="w-4 h-4 text-amber-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="max-w-5xl space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Public Reports</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-muted/50 focus:outline-none">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="civic-card-flat">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.username} · {r.category} · {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.riskLevel === 'High' ? 'risk-high' : 'risk-low'}`}>
                  Risk: {r.riskScore}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium flex items-center gap-1">
                  {statusIcon(r.status)} {r.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{r.description}</p>

            {r.image && <img src={r.image} alt="Report" className="rounded-xl max-h-32 object-cover w-full mb-3" />}

            <div className="flex items-center gap-4">
              <button onClick={() => likeReport(r.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <ThumbsUp className="w-3.5 h-3.5" /> {r.likes || 0} Support
              </button>
              <button onClick={() => setSelectedReport(selectedReport?.id === r.id ? null : r)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <MessageCircle className="w-3.5 h-3.5" /> {(r.comments || []).length} Comments
              </button>
              <button onClick={() => shareReport(r.title)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* AI Analysis mini */}
            <div className="mt-3 flex gap-3 text-xs">
              <span className="px-2 py-1 rounded-lg bg-muted"><AlertTriangle className="w-3 h-3 inline mr-1" />AI Conf: {r.aiConfidence}%</span>
              <span className="px-2 py-1 rounded-lg bg-muted">Sentiment: {r.sentiment}</span>
              <span className="px-2 py-1 rounded-lg bg-muted">Dept: {r.suggestedDepartment}</span>
            </div>

            {/* Comments section */}
            {selectedReport?.id === r.id && (
              <div className="mt-4 space-y-3">
                {(r.comments || []).length > 0 && (
                  <div className="space-y-2">
                    {(r.comments || []).map(c => (
                      <div key={c.id} className="bg-muted rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.username}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm mt-1">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(r.id)} placeholder="Add a comment..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => addComment(r.id)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Post</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
