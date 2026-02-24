import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getReports, getChats, addChat, addNotification } from '@/lib/storage';
import { generateAutoResponse } from '@/lib/ai-simulation';
import { Report, ChatMessage } from '@/lib/types';
import { X, Send, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function MyReports() {
  const { session } = useAuth();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const reports = getReports().filter(r => r.userId === session?.id);

  const statusIcon = (status: string) => {
    if (status === 'Resolved') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'In Progress') return <Clock className="w-4 h-4 text-amber-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedReport) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      reportId: selectedReport.id,
      senderId: session!.id,
      senderType: 'user',
      message: chatInput,
      timestamp: new Date().toISOString(),
    };
    addChat(msg);
    setChatInput('');
    setRefreshKey(k => k + 1);

    // Auto-response after 2s
    setTimeout(() => {
      addChat({
        id: `msg-${Date.now()}`,
        reportId: selectedReport.id,
        senderId: 'admin-1',
        senderType: 'admin',
        message: generateAutoResponse(),
        timestamp: new Date().toISOString(),
      });
      addNotification({
        id: `notif-${Date.now()}`,
        userId: session!.id,
        title: 'Chat Reply',
        message: `Admin replied to your report: ${selectedReport.title}`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });
      setRefreshKey(k => k + 1);
    }, 2000);
  };

  const chats = selectedReport ? getChats(selectedReport.id) : [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">My Reports</h1>

      {reports.length === 0 ? (
        <div className="civic-card-flat text-center text-muted-foreground py-12">
          No reports yet. Submit your first report!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.id} className="civic-card cursor-pointer" onClick={() => setSelectedReport(r)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{r.title}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${r.riskLevel === 'High' ? 'risk-high' : 'risk-low'}`}>
                  {r.riskScore}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{r.category}</p>
              <div className="flex items-center gap-2 text-sm">
                {statusIcon(r.status)}
                <span>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedReport.title}</h2>
              <button onClick={() => setSelectedReport(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-muted font-medium">{selectedReport.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selectedReport.riskLevel === 'High' ? 'risk-high' : 'risk-low'}`}>
                  Risk: {selectedReport.riskScore}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-muted font-medium flex items-center gap-1">
                  {statusIcon(selectedReport.status)} {selectedReport.status}
                </span>
              </div>

              <p className="text-sm">{selectedReport.description}</p>

              {selectedReport.image && (
                <img src={selectedReport.image} alt="Report" className="rounded-xl max-h-48 object-cover w-full" />
              )}

              {/* AI Analysis */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" /> AI Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Confidence:</span> {selectedReport.aiConfidence}%</div>
                  <div><span className="text-muted-foreground">Sentiment:</span> {selectedReport.sentiment}</div>
                  <div><span className="text-muted-foreground">Risk Level:</span> {selectedReport.riskLevel}</div>
                  <div><span className="text-muted-foreground">Department:</span> {selectedReport.suggestedDepartment}</div>
                </div>
              </div>

              {/* Chat */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Chat</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3" key={refreshKey}>
                  {chats.map(m => (
                    <div key={m.id} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={m.senderType === 'user' ? 'chat-user' : m.senderType === 'system' ? 'chat-system' : 'chat-admin'}>
                        <p className="text-sm">{m.message}</p>
                        <p className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Type a message..."
                  />
                  <button onClick={sendMessage} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
