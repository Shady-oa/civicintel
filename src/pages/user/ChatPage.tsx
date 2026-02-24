import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getReports, getChats, addChat, addNotification } from '@/lib/storage';
import { generateAutoResponse } from '@/lib/ai-simulation';
import { ChatMessage } from '@/lib/types';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const { session } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const reports = getReports().filter(r => r.userId === session?.id);
  const chats = selectedReportId ? getChats(selectedReportId) : [];

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedReportId) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      reportId: selectedReportId,
      senderId: session!.id,
      senderType: 'user',
      message: chatInput,
      timestamp: new Date().toISOString(),
    };
    addChat(msg);
    setChatInput('');
    setRefreshKey(k => k + 1);

    setTimeout(() => {
      addChat({
        id: `msg-${Date.now()}`,
        reportId: selectedReportId,
        senderId: 'admin-1',
        senderType: 'admin',
        message: generateAutoResponse(),
        timestamp: new Date().toISOString(),
      });
      addNotification({
        id: `notif-${Date.now()}`,
        userId: session!.id,
        title: 'Chat Reply',
        message: 'Admin replied to your message.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });
      setRefreshKey(k => k + 1);
    }, 2000);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Chat</h1>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Report List */}
        <div className="w-72 border border-border rounded-2xl overflow-y-auto shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm">Your Reports</h3>
          </div>
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedReportId(r.id)}
              className={`w-full text-left p-4 border-b border-border transition-colors ${selectedReportId === r.id ? 'bg-accent' : 'hover:bg-muted'}`}
            >
              <p className="font-medium text-sm truncate">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.category}</p>
            </button>
          ))}
          {reports.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No reports yet</p>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 border border-border rounded-2xl flex flex-col">
          {selectedReportId ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2" key={refreshKey}>
                {chats.map(m => (
                  <div key={m.id} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={m.senderType === 'user' ? 'chat-user' : m.senderType === 'system' ? 'chat-system' : 'chat-admin'}>
                      <p className="text-sm">{m.message}</p>
                      <p className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {chats.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
                )}
              </div>
              <div className="p-4 border-t border-border flex gap-2">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a report to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
