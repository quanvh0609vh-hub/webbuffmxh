import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, Search, Circle, Headphones, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { formatDateTime } from '../../utils/format';

export default function AdminChat() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newActivity, setNewActivity] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchTickets();
    setupSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('ticket-activity');
        socket.off('admin-reply');
        socket.off('new-message');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('online-users');
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket._id);

      // Poll for new messages every 3s
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchTicketMessages(selectedTicket._id, true);
      }, 3000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [selectedTicket?._id]);

  const setupSocket = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen for ticket activity (new tickets, new messages)
    socket.on('ticket-activity', (data) => {
      // Refresh ticket list
      fetchTickets(true);
      // Show indicator if different ticket is selected
      if (selectedTicket && selectedTicket._id !== data.ticketId) {
        setNewActivity(prev => ({ ...prev, [data.ticketId]: true }));
      }
    });

    // Listen for admin replies to refresh messages
    socket.on('admin-reply', (data) => {
      if (selectedTicket && selectedTicket._id === data.ticketId) {
        setMessages(prev => {
          if (prev.some(m => m._id === data._id)) return prev;
          return [...prev, data];
        });
      }
    });

    socket.on('new-message', (data) => {
      if (selectedTicket && selectedTicket._id === data.ticketId) {
        setMessages(prev => {
          if (prev.some(m => m._id === data._id)) return prev;
          return [...prev, data];
        });
      }
    });

    socket.on('online-users', (users) => {
      // Could show online users count
    });

    if (socket.connected) setConnected(true);
  };

  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/support/admin/all');
      const ticketList = response.data.data?.tickets || response.data.tickets || [];
      setTickets(ticketList);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId, silent = false) => {
    try {
      const res = await api.get(`/support/${ticketId}`);
      const ticket = res.data.data?.ticket || res.data.data;
      if (ticket) {
        setMessages(ticket.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setNewActivity(prev => ({ ...prev, [ticket._id]: false }));
  };

  const sendReply = async () => {
    if (!inputText.trim() || !selectedTicket) return;
    setSubmitting(true);

    const msgText = inputText.trim();
    setInputText('');

    try {
      await api.post(`/support/admin/${selectedTicket._id}/reply`, { message: msgText });

      // Optimistic update
      setMessages(prev => [
        ...prev,
        {
          _id: `temp-${Date.now()}`,
          sender: 'admin',
          message: msgText,
          createdAt: new Date()
        }
      ]);

      // Notify user via socket
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', {
          ticketId: selectedTicket._id,
          message: msgText,
          sender: 'admin'
        });
      }

      // Refresh ticket list to update last message
      fetchTickets(true);
    } catch (err) {
      setInputText(msgText);
      console.error('Failed to send reply:', err);
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicketData = tickets.find(t => t._id === selectedTicket?._id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#6C63FF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Ho tro chat</h1>
            <div className="flex items-center gap-2">
              <Circle className={`w-2 h-2 ${connected ? 'fill-[#00d4aa] text-[#00d4aa]' : 'fill-gray-500 text-gray-500'}`} />
              <span className="text-xs text-[#6b6b80]">
                {connected ? 'Online' : 'Offline'} - {tickets.filter(t => t.status === 'open').length} cuoc hoi thoai dang mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Ticket List */}
        <div className="w-80 flex-shrink-0 bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-[#2d2d44]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input
                type="text"
                placeholder="Tim kiem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
              />
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center text-[#6b6b80] text-sm">
                Khong co cuoc hoi thoai nao
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => selectTicket(ticket)}
                  className={`p-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[#2d2d44]/50 ${
                    selectedTicket?._id === ticket._id ? 'bg-[#6C63FF]/10 border-l-2 border-l-[#6C63FF]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate max-w-[160px]">
                        {ticket.user?.username || 'User'}
                      </span>
                      {newActivity[ticket._id] && (
                        <span className="w-2 h-2 rounded-full bg-[#ff4757] flex-shrink-0" />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ticket.status === 'open'
                        ? 'bg-[#00d4aa]/10 text-[#00d4aa]'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {ticket.status === 'open' ? 'Mo' : 'Dong'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6b80] truncate">{ticket.subject}</p>
                  <p className="text-xs text-[#6b6b80] mt-1">
                    {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-[#2d2d44] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C63FF]/10 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-[#6C63FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedTicketData?.user?.username || selectedTicket.user?.username || 'User'}
                    </p>
                    <p className="text-xs text-[#6b6b80]">
                      {selectedTicketData?.user?.email || selectedTicket.user?.email || ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  selectedTicket.status === 'open'
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa]'
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {selectedTicket.status === 'open' ? 'Dang mo' : 'Da dong'}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Headphones className="w-10 h-10 text-[#6b6b80] mb-3" />
                    <p className="text-[#6b6b80] text-sm">Chua co tin nhan nao</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg._id || idx}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                          msg.sender === 'admin'
                            ? 'bg-[#6C63FF] text-white rounded-tr-sm'
                            : 'bg-[#0f0f1a] text-[#a0a0b0] border border-[#2d2d44] rounded-tl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' ? 'text-white/60' : 'text-[#6b6b80]'
                        }`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-[#2d2d44]">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        placeholder="Nhap tra loi..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                      />
                    </div>
                    <button
                      onClick={sendReply}
                      disabled={submitting || !inputText.trim()}
                      className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#6C63FF] hover:bg-[#7a73ff] disabled:opacity-40 flex items-center justify-center transition-all shadow-lg shadow-[#6C63FF]/20"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#6C63FF]" />
              </div>
              <h3 className="text-white font-medium mb-2">Chon cuoc hoi thoai</h3>
              <p className="text-sm text-[#6b6b80] max-w-xs">
                Chon mot cuoc hoi thoai tu danh sach ben trai de bat dau tra loi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
