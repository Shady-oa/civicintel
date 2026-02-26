import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getProjectExpenses, getProjectFeedback, addProjectFeedback, updateProjectFeedback } from '@/lib/storage';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/lib/types';

export default function PublicProjects() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [fbImage, setFbImage] = useState<string | undefined>();

  const projects = getProjects();

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !selectedProject) return;

    addProjectFeedback({
      id: `fb-${Date.now()}`, projectId: selectedProject.id,
      userId: session!.id, username: session!.username,
      comment, image: fbImage, rating, upvotes: 0, upvotedBy: [],
      createdAt: new Date().toISOString(),
    });
    toast.success('Feedback submitted');
    setComment(''); setRating(5); setFbImage(undefined);
    setRefreshKey(k => k + 1);
  };

  const upvote = (fbId: string) => {
    const fb = getProjectFeedback().find(f => f.id === fbId);
    if (!fb || fb.upvotedBy.includes(session!.id)) return;
    updateProjectFeedback(fbId, { upvotes: fb.upvotes + 1, upvotedBy: [...fb.upvotedBy, session!.id] });
    setRefreshKey(k => k + 1);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFbImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl space-y-6" key={refreshKey}>
      <h1 className="text-2xl font-bold">Public Projects</h1>
      <p className="text-muted-foreground">Track government projects, budgets, and progress in real-time.</p>

      <div className="space-y-4">
        {projects.map(p => {
          const expenses = getProjectExpenses(p.id);
          const feedback = getProjectFeedback(p.id);
          const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : 'N/A';
          const remaining = p.totalBudget - p.fundsSpent;
          const isOver = remaining < 0;
          const isSelected = selectedProject?.id === p.id;

          return (
            <div key={p.id} className="civic-card-flat">
              {isOver && (
                <div className="bg-danger-light border border-destructive/20 rounded-xl p-2 mb-3 text-xs font-semibold text-danger flex items-center gap-2">
                  ⚠ Budget Exceeded
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.region} · {p.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">Official: {p.assignedOfficial} · Dept: {p.department}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    p.status === 'Completed' ? 'risk-low' : p.status === 'Delayed' ? 'risk-high' : 'bg-muted text-foreground'
                  }`}>{p.status}</span>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {avgRating}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress: {p.progress}%</span>
                  <span>{p.startDate ? new Date(p.startDate).toLocaleDateString() : ''} → {p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toLocaleDateString() : ''}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Budget */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Budget: KES {p.fundsSpent.toLocaleString()} / {p.totalBudget.toLocaleString()}</span>
                  <span className={isOver ? 'text-danger font-semibold' : ''}>Remaining: KES {remaining.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isOver ? 'bg-destructive' : p.fundsSpent / p.totalBudget > 0.85 ? 'bg-amber-500' : 'bg-success'}`}
                    style={{ width: `${Math.min(100, (p.fundsSpent / p.totalBudget) * 100)}%` }} />
                </div>
              </div>

              <button onClick={() => setSelectedProject(isSelected ? null : p)} className="text-xs text-primary hover:underline font-medium">
                {isSelected ? 'Hide details' : `View details & feedback (${feedback.length})`}
              </button>

              {isSelected && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm">{p.description}</p>

                  {/* Expense Breakdown */}
                  {expenses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Expense Breakdown</h4>
                      <div className="space-y-1">
                        {expenses.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between text-xs bg-muted rounded-lg px-3 py-2">
                            <span>{ex.title}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">{ex.category}</span>
                              <span className="font-medium">KES {ex.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.supportingDocument && <img src={p.supportingDocument} alt="Document" className="rounded-xl max-h-40 object-cover" />}

                  {/* Feedback */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Citizen Feedback
                    </h4>
                    {feedback.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {feedback.sort((a, b) => b.upvotes - a.upvotes).map(fb => (
                          <div key={fb.id} className="bg-muted rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{fb.username}</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground ml-auto">{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{fb.comment}</p>
                            {fb.image && <img src={fb.image} alt="Evidence" className="mt-2 rounded-lg max-h-24 object-cover" />}
                            <button onClick={() => upvote(fb.id)} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                              <ThumbsUp className="w-3 h-3" /> {fb.upvotes} Support
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit feedback */}
                    <form onSubmit={submitFeedback} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Your rating:</span>
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setRating(s)}>
                            <Star className={`w-5 h-5 cursor-pointer ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your feedback..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                          <span className="px-3 py-2.5 rounded-xl border border-dashed border-border text-sm hover:bg-muted/50 inline-block">📷</span>
                        </label>
                        <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Submit</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
