import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, addProject, updateProject, getProjectExpenses, addProjectExpense, addNotification, addAuditLog } from '@/lib/storage';
import { predictCompletionDelay, predictBudgetOverrun } from '@/lib/ai-simulation';
import { toast } from 'sonner';
import { Plus, X, DollarSign, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import { Project, ProjectExpense } from '@/lib/types';
import StatCard from '@/components/StatCard';

export default function ProjectsBudget() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Project form
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pRegion, setPRegion] = useState('');
  const [pLocation, setPLocation] = useState('');
  const [pOfficial, setPOfficial] = useState('');
  const [pDepartment, setPDepartment] = useState('');
  const [pStartDate, setPStartDate] = useState('');
  const [pEndDate, setPEndDate] = useState('');
  const [pBudget, setPBudget] = useState('');
  const [pReleased, setPReleased] = useState('');
  const [pStatus, setPStatus] = useState<Project['status']>('Planning');
  const [pProgress, setPProgress] = useState('0');
  const [pImage, setPImage] = useState<string | undefined>();

  // Expense form
  const [eTitle, setETitle] = useState('');
  const [eAmount, setEAmount] = useState('');
  const [eDate, setEDate] = useState('');
  const [eCategory, setECategory] = useState<ProjectExpense['category']>('Materials');
  const [eDesc, setEDesc] = useState('');
  const [eReceipt, setEReceipt] = useState<string | undefined>();

  const projects = getProjects();
  const allExpenses = getProjectExpenses();

  const totalBudget = projects.reduce((s, p) => s + p.totalBudget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.fundsSpent, 0);
  const activeProjects = projects.filter(p => p.status === 'Ongoing' || p.status === 'Planning').length;
  const delayed = projects.filter(p => p.status === 'Delayed').length;

  const resetProjectForm = () => {
    setShowProjectForm(false);
    setPTitle(''); setPDesc(''); setPRegion(''); setPLocation(''); setPOfficial(''); setPDepartment('');
    setPStartDate(''); setPEndDate(''); setPBudget(''); setPReleased(''); setPStatus('Planning'); setPProgress('0'); setPImage(undefined);
  };

  const resetExpenseForm = () => {
    setShowExpenseForm(null);
    setETitle(''); setEAmount(''); setEDate(''); setECategory('Materials'); setEDesc(''); setEReceipt(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | undefined) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pRegion || !pBudget) { toast.error('Fill required fields'); return; }

    const project: Project = {
      id: `proj-${Date.now()}`,
      title: pTitle, description: pDesc, region: pRegion, location: pLocation,
      assignedOfficial: pOfficial, department: pDepartment,
      startDate: pStartDate || new Date().toISOString(), expectedCompletionDate: pEndDate || new Date().toISOString(),
      totalBudget: Number(pBudget), fundsReleased: Number(pReleased) || 0, fundsSpent: 0,
      status: pStatus, progress: Number(pProgress),
      supportingDocument: pImage, createdBy: session!.username, createdAt: new Date().toISOString(),
    };

    addProject(project);
    addAuditLog({ id: `audit-${Date.now()}`, adminId: session!.id, adminName: session!.username, action: 'Project Created', details: `Created project "${pTitle}"`, timestamp: new Date().toISOString() });
    toast.success('Project created');
    resetProjectForm();
    setRefreshKey(k => k + 1);
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTitle || !eAmount || !showExpenseForm) { toast.error('Fill required fields'); return; }

    const expense: ProjectExpense = {
      id: `exp-${Date.now()}`, projectId: showExpenseForm,
      title: eTitle, amount: Number(eAmount), date: eDate || new Date().toISOString(),
      category: eCategory, description: eDesc, receipt: eReceipt, createdAt: new Date().toISOString(),
    };

    addProjectExpense(expense);

    // Update project spent
    const project = projects.find(p => p.id === showExpenseForm);
    if (project) {
      const newSpent = project.fundsSpent + Number(eAmount);
      updateProject(showExpenseForm, { fundsSpent: newSpent });

      if (newSpent > project.totalBudget) {
        addNotification({ id: `notif-${Date.now()}`, userId: 'admin-1', title: '🚨 Budget Overrun', message: `Project "${project.title}" has exceeded its budget!`, type: 'error', read: false, createdAt: new Date().toISOString() });
        // Notify all users
        addNotification({ id: `notif-${Date.now()}-pub`, userId: 'all', title: 'Budget Alert', message: `Project "${project.title}" has exceeded its allocated budget.`, type: 'warning', read: false, createdAt: new Date().toISOString() });
      }

      addNotification({ id: `notif-${Date.now()}-exp`, userId: 'admin-1', title: 'Expense Added', message: `KES ${Number(eAmount).toLocaleString()} added to "${project.title}"`, type: 'info', read: false, createdAt: new Date().toISOString() });
    }

    addAuditLog({ id: `audit-${Date.now()}`, adminId: session!.id, adminName: session!.username, action: 'Expense Added', details: `Added KES ${Number(eAmount).toLocaleString()} expense to "${project?.title}"`, timestamp: new Date().toISOString() });
    toast.success('Expense added');
    resetExpenseForm();
    setRefreshKey(k => k + 1);
  };

  const getBudgetStatus = (p: Project) => {
    const ratio = p.fundsSpent / p.totalBudget;
    if (ratio > 1) return { color: 'bg-destructive', label: 'Over Budget', textColor: 'text-danger' };
    if (ratio > 0.85) return { color: 'bg-amber-500', label: 'Near Limit', textColor: 'text-amber-500' };
    return { color: 'bg-success', label: 'Healthy', textColor: 'text-success' };
  };

  return (
    <div className="max-w-6xl space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects & Budget Tracker</h1>
        <button onClick={() => setShowProjectForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={activeProjects} icon={Building2} color="bg-primary/10 text-primary" />
        <StatCard label="Total Budget" value={`KES ${(totalBudget / 1000000).toFixed(1)}M`} icon={DollarSign} color="bg-success-light text-success" />
        <StatCard label="Total Spent" value={`KES ${(totalSpent / 1000000).toFixed(1)}M`} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
        <StatCard label="Delayed" value={delayed} icon={AlertTriangle} color="bg-danger-light text-danger" />
      </div>

      {/* New Project Form */}
      {showProjectForm && (
        <div className="civic-card-flat">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Create New Project</h3>
            <button onClick={resetProjectForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={submitProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Project Title *" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={pRegion} onChange={e => setPRegion(e.target.value)} placeholder="Region / County *" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={pLocation} onChange={e => setPLocation(e.target.value)} placeholder="Specific Location" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={pOfficial} onChange={e => setPOfficial(e.target.value)} placeholder="Assigned Official" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={pDepartment} onChange={e => setPDepartment(e.target.value)} placeholder="Department" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={pStatus} onChange={e => setPStatus(e.target.value as Project['status'])} className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>Planning</option><option>Ongoing</option><option>Completed</option><option>Delayed</option>
            </select>
            <input type="date" value={pStartDate} onChange={e => setPStartDate(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Start Date" />
            <input type="date" value={pEndDate} onChange={e => setPEndDate(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Expected Completion" />
            <input type="number" value={pBudget} onChange={e => setPBudget(e.target.value)} placeholder="Total Budget (KES) *" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="number" value={pReleased} onChange={e => setPReleased(e.target.value)} placeholder="Funds Released (KES)" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="number" value={pProgress} onChange={e => setPProgress(e.target.value)} min="0" max="100" placeholder="Progress %" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Project Description" className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 md:col-span-2 resize-none" rows={3} />
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setPImage)} className="hidden" />
                <span className="px-3 py-1.5 rounded-lg border border-dashed border-border hover:bg-muted/50">Upload Document</span>
              </label>
              <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Create Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-4">
        {projects.map(p => {
          const budget = getBudgetStatus(p);
          const expenses = allExpenses.filter(e => e.projectId === p.id);
          const remaining = p.totalBudget - p.fundsSpent;
          const daysElapsed = Math.floor((Date.now() - new Date(p.startDate).getTime()) / 86400000);
          const totalDays = Math.max(1, Math.floor((new Date(p.expectedCompletionDate).getTime() - new Date(p.startDate).getTime()) / 86400000));
          const delay = predictCompletionDelay(p.progress, daysElapsed, totalDays);
          const overrun = predictBudgetOverrun(p.totalBudget, p.fundsSpent, p.progress);

          return (
            <div key={p.id} className="civic-card-flat">
              {p.fundsSpent > p.totalBudget && (
                <div className="bg-danger-light border border-destructive/20 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <span className="text-sm font-semibold text-danger">⚠ Budget Exceeded by KES {(p.fundsSpent - p.totalBudget).toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.region} · {p.location} · {p.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">Official: {p.assignedOfficial} · Created by: {p.createdBy}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    p.status === 'Completed' ? 'risk-low' : p.status === 'Delayed' ? 'risk-high' : 'bg-muted text-foreground'
                  }`}>{p.status}</span>
                  <button onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)} className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 font-medium">
                    {selectedProject?.id === p.id ? 'Hide' : 'Details'}
                  </button>
                  <button onClick={() => setShowExpenseForm(p.id)} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">
                    + Expense
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress: {p.progress}%</span>
                  <span className={budget.textColor}>{budget.label}</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Budget bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Budget: KES {p.fundsSpent.toLocaleString()} / {p.totalBudget.toLocaleString()}</span>
                  <span className={remaining < 0 ? 'text-danger font-semibold' : 'text-muted-foreground'}>
                    Remaining: KES {remaining.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${budget.color}`} style={{ width: `${Math.min(100, (p.fundsSpent / p.totalBudget) * 100)}%` }} />
                </div>
              </div>

              {/* AI Predictions */}
              <div className="flex gap-4 text-xs">
                <span className="px-2 py-1 rounded-lg bg-muted">
                  🤖 Delay Risk: <strong className={delay.delayProbability > 50 ? 'text-danger' : 'text-success'}>{delay.delayProbability}%</strong> ({delay.confidence}% conf.)
                </span>
                <span className="px-2 py-1 rounded-lg bg-muted">
                  🤖 Overrun Risk: <strong className={overrun.overrunProbability > 50 ? 'text-danger' : 'text-success'}>{overrun.overrunProbability}%</strong> ({overrun.confidence}% conf.)
                </span>
              </div>

              {/* Expense Form Inline */}
              {showExpenseForm === p.id && (
                <div className="mt-4 p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Add Expense</h4>
                    <button onClick={resetExpenseForm}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <form onSubmit={submitExpense} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={eTitle} onChange={e => setETitle(e.target.value)} placeholder="Expense Title *" className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="number" value={eAmount} onChange={e => setEAmount(e.target.value)} placeholder="Amount (KES) *" className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="date" value={eDate} onChange={e => setEDate(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <select value={eCategory} onChange={e => setECategory(e.target.value as ProjectExpense['category'])} className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option>Materials</option><option>Labor</option><option>Transport</option><option>Consultancy</option><option>Other</option>
                    </select>
                    <input value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Description" className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setEReceipt)} className="hidden" />
                      <span className="px-3 py-2 rounded-lg border border-dashed border-border bg-background hover:bg-muted/50 text-sm">{eReceipt ? 'Receipt attached' : 'Upload receipt'}</span>
                    </label>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold md:col-span-2">Add Expense</button>
                  </form>
                </div>
              )}

              {/* Detailed View */}
              {selectedProject?.id === p.id && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm">{p.description}</p>
                  {p.supportingDocument && <img src={p.supportingDocument} alt="Document" className="rounded-xl max-h-40 object-cover" />}

                  <h4 className="font-semibold text-sm">Expense Breakdown</h4>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-muted">
                          <th className="text-left px-3 py-2 font-semibold">Title</th>
                          <th className="text-left px-3 py-2 font-semibold">Amount</th>
                          <th className="text-left px-3 py-2 font-semibold">Category</th>
                          <th className="text-left px-3 py-2 font-semibold">Date</th>
                        </tr></thead>
                        <tbody>
                          {expenses.map(ex => (
                            <tr key={ex.id} className="border-t border-border">
                              <td className="px-3 py-2">{ex.title}</td>
                              <td className="px-3 py-2 font-medium">KES {ex.amount.toLocaleString()}</td>
                              <td className="px-3 py-2 text-muted-foreground">{ex.category}</td>
                              <td className="px-3 py-2 text-muted-foreground">{new Date(ex.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
