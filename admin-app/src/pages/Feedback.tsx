import React, { useState } from 'react';

interface Message {
  id: number;
  from: string;
  role: 'driver' | 'customer' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
}

const Feedback: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'John K. (Driver)', role: 'driver', content: 'Vehicle maintenance completed. Ready for dispatch.', timestamp: '10:23 AM', read: false },
    { id: 2, from: 'Customer #4521', role: 'customer', content: 'Great service! The driver was very professional.', timestamp: '09:45 AM', read: true },
    { id: 3, from: 'System', role: 'system', content: 'Daily backup completed successfully.', timestamp: '08:00 AM', read: true },
    { id: 4, from: 'Mary T. (Driver)', role: 'driver', content: 'Running low on fuel. Need to refuel at Nketa.', timestamp: 'Yesterday', read: false },
  ]);

  const [replyText, setReplyText] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<number | null>(null);

  const handleSend = () => {
    if (!replyText.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      from: 'Admin',
      role: 'system',
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    setMessages([newMsg, ...messages]);
    setReplyText('');
  };

  const markAsRead = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    setSelectedMsg(id);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'customer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Communications</h1>
        <p className="text-slate-400 mt-1">Driver feedback, customer reviews &amp; system alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-white font-bold">Inbox</h3>
            <p className="text-slate-400 text-sm">{messages.filter(m => !m.read).length} unread</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => markAsRead(msg.id)}
                className={`w-full text-left p-4 border-b border-slate-700/30 transition-colors ${
                  selectedMsg === msg.id ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
                } ${!msg.read ? 'border-l-2 border-l-emerald-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate">{msg.from}</span>
                  <span className="text-slate-500 text-xs">{msg.timestamp}</span>
                </div>
                <p className="text-slate-400 text-sm truncate">{msg.content}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
          {selectedMsg ? (
            <div className="h-full flex flex-col">
              {(() => {
                const msg = messages.find(m => m.id === selectedMsg);
                if (!msg) return null;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(msg.role)}`}>
                        {msg.role}
                      </span>
                      <span className="text-white font-bold">{msg.from}</span>
                      <span className="text-slate-500 text-sm ml-auto">{msg.timestamp}</span>
                    </div>
                    <div className="flex-1 bg-slate-700/30 rounded-xl p-4 mb-4">
                      <p className="text-slate-200">{msg.content}</p>
                    </div>
                  </>
                );
              })()}
              <div className="mt-auto">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a reply..."
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={handleSend}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;

