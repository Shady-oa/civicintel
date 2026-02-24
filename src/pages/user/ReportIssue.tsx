import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addReport, addNotification } from '@/lib/storage';
import { getCategories, generateRiskScore, getRiskLevel, generateAIConfidence, detectSentiment, suggestDepartment } from '@/lib/ai-simulation';
import { toast } from 'sonner';
import { Upload, Send } from 'lucide-react';

export default function ReportIssue() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [anonymous, setAnonymous] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const riskScore = generateRiskScore();
    const report = {
      id: `report-${Date.now()}`,
      userId: session!.id,
      username: anonymous ? 'Anonymous' : session!.username,
      title,
      category,
      description,
      image,
      anonymous,
      status: 'Pending' as const,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      aiConfidence: generateAIConfidence(),
      sentiment: detectSentiment(),
      suggestedDepartment: suggestDepartment(category),
      createdAt: new Date().toISOString(),
    };

    addReport(report);
    addNotification({
      id: `notif-${Date.now()}`,
      userId: session!.id,
      title: 'Report Submitted',
      message: `Your report "${title}" has been submitted successfully.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    toast.success('Report submitted successfully');
    setTitle(''); setCategory(''); setDescription(''); setImage(undefined); setAnonymous(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Report an Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Brief title of the issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select category</option>
            {getCategories().map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Describe the issue in detail"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Upload Image (optional)</label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{image ? 'Image selected' : 'Click to upload'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          {image && (
            <img src={image} alt="Preview" className="mt-3 rounded-xl max-h-40 object-cover" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAnonymous(!anonymous)}
            className={`w-11 h-6 rounded-full transition-colors relative ${anonymous ? 'bg-primary' : 'bg-border'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm font-medium">Submit anonymously</span>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
          Submit Report
        </button>
      </form>
    </div>
  );
}
