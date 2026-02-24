import { useState } from 'react';
import { getReports, getChats, addChat } from '@/lib/storage';
import { Send, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatCenter() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const reports = getReports();
  const chats = selectedReportId ? getChats(selectedReportId) : [];

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedReportId) return;
    addChat({
      id: `msg-${Date.now()}`,
      reportId: selectedReportId,
      senderId: 'admin',
      senderType: 'admin',
      message: chatInput,
      timestamp: new Date().toISOString(),
    });
    setChatInput('');
    setRefreshKey(k => k + 1);
  };

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    reports.forEach(r => {
      addChat({
        id: `msg-${Date.now()}-${r.id}`,
        reportId: r.id,
        senderId: 'admin',
        senderType: 'system',
        message: `[BROADCAST] ${broadcastMsg}`,
        timestamp: new Date().toISOString(),
      });
    });
    toast.success('Broadcast sent to all report chats');
    setBroadcastMsg('');
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-6xl space-y-6" key={refreshKey}>
      <h1 className="text-2xl font-bold">Chat Center</h1>

      {/* Broadcast */}
      <div className="civic-card-flat">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> Broadcast Message
        </h3>
        <div className="flex gap-2">
          <input
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Type broadcast message..."
          />
          <button onClick={sendBroadcast} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Send All
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-360px)]">
        {/* Report list */}
        <div className="w-72 border border-border rounded-2xl overflow-y-auto shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm">All Reports ({reports.length})</h3>
          </div>
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedReportId(r.id)}
              className={`w-full text-left p-4 border-b border-border transition-colors ${selectedReportId === r.id ? 'bg-accent' : 'hover:bg-muted'}`}
            >
              <p className="font-medium text-sm truncate">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.username} · {r.category}</p>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 border border-border rounded-2xl flex flex-col">
          {selectedReportId ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chats.map(m => (
                  <div key={m.id} className={`flex ${m.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={m.senderType === 'admin' ? 'chat-user' : m.senderType === 'system' ? 'chat-system' : 'chat-admin'}>
                      <p className="text-sm">{m.message}</p>
                      <p className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {chats.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">No messages yet</p>
                )}
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Reply as admin..."
                />
                <button onClick={sendMessage} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a report to view chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
