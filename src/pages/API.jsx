import { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, RefreshCw, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

export default function API() {
  const [apiKey, setApiKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [docsOpen, setDocsOpen] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApiKey = async () => {
    try {
      const response = await api.get('/user/api-key');
      setApiKey(response.data.data?.apiKey || response.data.apiKey || '');
    } catch (err) {
      console.error('Failed to fetch API key:', err);
      setApiKey('');
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/user/api-key');
      setApiKey(response.data.data?.apiKey || response.data.apiKey || '');
      showToast('Đã tạo API key mới');
    } catch (err) {
      showToast('Tạo API key thất bại');
    } finally {
      setGenerating(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      showToast('Đã copy API key');
    }).catch(() => {
      showToast('Copy thất bại');
    });
  };

  const toggleSection = (section) => {
    setDocsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/30'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Truy cập API</h1>
        <p className="text-sm text-[#a0a0b0]">Tích hợp webbuffMXH với ứng dụng của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* API Key Card */}
          <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2d2d44]">
              <Key className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="font-semibold text-white">API Key của bạn</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0f0f1a] border border-[#2d2d44]">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-sm text-[#00d4aa] font-mono break-all">
                      {apiKey
                        ? visible
                          ? apiKey
                          : apiKey.length > 20
                            ? apiKey.substring(0, 4) + '*'.repeat(Math.min(apiKey.length - 8, 32)) + apiKey.substring(apiKey.length - 4)
                            : '*'.repeat(apiKey.length)
                        : 'Chua co API key'}
                    </code>
                    <button
                      onClick={() => setVisible(!visible)}
                      className="p-2 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white transition-colors flex-shrink-0"
                    >
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={copyKey}
                      disabled={!apiKey}
                      className="p-2 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white transition-colors flex-shrink-0 disabled:opacity-30"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={generateKey}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d2d44] text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/30 text-sm font-medium transition-all"
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )} Tao key moi
                </button>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2d2d44]">
              <BookOpen className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="font-semibold text-white">Tai lieu API</h3>
            </div>
            <div className="p-4 space-y-3">
              {DOCS_SECTIONS.map((section) => (
                <div key={section.title} className="border border-[#2d2d44] rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-medium text-white">{section.title}</span>
                    {docsOpen[section.title] ? (
                      <ChevronUp className="w-4 h-4 text-[#6b6b80]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6b6b80]" />
                    )}
                  </button>
                  {docsOpen[section.title] && (
                    <div className="px-4 pb-4">
                      <pre className="p-4 rounded-lg bg-[#0f0f1a] text-xs text-[#00d4aa] font-mono overflow-x-auto">
                        {section.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
            <div className="px-5 py-4 border-b border-[#2d2d44]">
              <h3 className="font-semibold text-white">Hướng dẫn sử dụng</h3>
            </div>
            <div className="p-5">
              <ul className="space-y-3 text-sm text-[#a0a0b0]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00d4aa] mt-0.5">-</span>
                  <span>Su dung HTTPS cho tat ca cac yeu cau API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00d4aa] mt-0.5">-</span>
                  <span>Them API key vao header Authorization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00d4aa] mt-0.5">-</span>
                  <span>Gioi han: 100 yeu cau moi phut</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00d4aa] mt-0.5">-</span>
                  <span>Tat ca gia tien bang USD</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ffa502] mt-0.5">-</span>
                  <span>Bao mat API key cua ban</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
            <div className="px-5 py-4 border-b border-[#2d2d44]">
              <h3 className="font-semibold text-white">Base URL</h3>
            </div>
            <div className="p-5">
              <code className="text-xs text-[#00d4aa] font-mono bg-white/5 px-3 py-2 rounded-lg block break-all">
                https://api.webbuffmxh.com/v1
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DOCS_SECTIONS = [
  {
    title: 'Tao don hang',
    code: `POST /api/v1/orders

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "serviceId": "dich_vu_id",
  "link": "https://instagram.com/p/ABC123",
  "quantity": 500
}

Response:
{
  "success": true,
  "data": {
    "order": {
      "orderId": "ord_abc123",
      "status": "pending",
      "charge": 7.50
    }
  }
}`,
  },
  {
    title: 'Lay trang thai don hang',
    code: `GET /api/v1/orders/{order_id}

Headers:
  Authorization: Bearer YOUR_API_KEY

Response:
{
  "success": true,
  "data": {
    "order": {
      "orderId": "ord_abc123",
      "status": "processing",
      "start_count": 100,
      "remains": 350,
      "charge": 7.50
    }
  }
}`,
  },
  {
    title: 'Lay danh sach dich vu',
    code: `GET /api/v1/services

Headers:
  Authorization: Bearer YOUR_API_KEY

Response:
{
  "success": true,
  "data": {
    "services": [
      {
        "_id": "1",
        "name": "Instagram Followers",
        "category": "Instagram",
        "pricePer1k": 0.015,
        "minOrder": 10,
        "maxOrder": 10000,
        "averageTime": "~12h"
      }
    ]
  }
}`,
  },
  {
    title: 'Lay so du',
    code: `GET /api/v1/balance

Headers:
  Authorization: Bearer YOUR_API_KEY

Response:
{
  "success": true,
  "data": {
    "balance": 125.50,
    "currency": "USD"
  }
}`,
  },
];
