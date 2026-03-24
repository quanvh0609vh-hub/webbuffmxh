import { useState, useEffect, useRef } from 'react';
import { Headphones, MessageCircle, SendHorizontal, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { formatDateTime } from '../utils/format';

export default function Support() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchChat();
    setupSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new-message');
        socket.off('admin-reply');
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocket = () => {
    const socket = getSocket();
    if (!socket) return;

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('admin-reply', (data) => {
      if (data.sender === 'admin') {
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now(),
            sender: 'admin',
            message: data.message,
            createdAt: data.createdAt || new Date()
          }
        ]);
      }
    });

    socket.on('new-message', (data) => {
      if (data.sender === 'admin') {
        setMessages((prev) => {
          if (prev.some(m => m._id === data._id)) return prev;
          return [
            ...prev,
            {
              _id: data._id || Date.now(),
              sender: 'admin',
              message: data.message,
              createdAt: data.createdAt || new Date()
            }
          ];
        });
      }
    });

    if (socket.connected) setConnected(true);
  };

  const fetchChat = async () => {
    try {
      const response = await api.get('/support');
      const tickets = response.data.data?.tickets || response.data.tickets || [];
      if (tickets.length > 0) {
        const openTicket = tickets.find(t => t.status === 'open') || tickets[0];
        const detailRes = await api.get(`/support/${openTicket._id}`);
        const ticket = detailRes.data.data?.ticket || detailRes.data.data || openTicket;
        setMessages(ticket.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    setSubmitting(true);

    const msgText = inputText.trim();
    setInputText('');

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: 'user',
      message: msgText,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const response = await api.post('/support/reply', { message: msgText });

      setMessages((prev) => {
        const filtered = prev.filter(m => m._id !== tempMsg._id);
        const newMsg = response.data.data?.ticket?.messages?.slice(-1)[0] ||
                       response.data.data?.message ||
                       { _id: tempMsg._id, sender: 'user', message: msgText, createdAt: tempMsg.createdAt };
        return [...filtered, { ...newMsg, sender: 'user' }];
      });

      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', {
          message: msgText,
          sender: 'user'
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter(m => m._id !== tempMsg._id));
      setInputText(msgText);
      showToast('Gui tin nhan that bai');
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/30'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-[#6C63FF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Ho tro</h1>
            <div className="flex items-center gap-2">
              <Circle className={`w-2 h-2 ${connected ? 'fill-[#00d4aa] text-[#00d4aa]' : 'fill-gray-500 text-gray-500'}`} />
              <span className="text-xs text-[#6b6b80]">{connected ? 'Dang hoat dong' : 'Ngoai tuyen'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-[#6C63FF]" />
              </div>
              <h3 className="text-white font-medium mb-2">Bat dau tro chuyen</h3>
              <p className="text-sm text-[#6b6b80] max-w-xs">
                Gui tin nhan de bat dau tro chuyen voi doi ngu ho tro. Chung toi san sang giup ban 24/7.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#6C63FF] text-white rounded-tr-sm'
                      : 'bg-[#0f0f1a] text-[#a0a0b0] border border-[#2d2d44] rounded-tl-sm'
                  }`}
                >
                  {msg.sender === 'admin' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Headphones className="w-3 h-3 text-[#6C63FF]" />
                      <span className="text-xs font-medium text-[#6C63FF]">Ho tro</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-white/60' : 'text-[#6b6b80]'
                  }`}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#2d2d44]">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder="Nhap tin nhan..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] resize-none transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={submitting || !inputText.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#6C63FF] hover:bg-[#7a73ff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendHorizontal className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-[#6b6b80] mt-2 px-1">
            Nhan Enter de gui, Shift+Enter de xuong dong
          </p>
        </div>
      </div>
    </div>
  );
}
