import { useState, useEffect, useRef } from 'react';
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, Plus, QrCode, Copy, Check, Clock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDateTime } from '../utils/format';

const AMOUNT_PRESETS = [50000, 100000, 200000, 500000, 1000000];

function formatVND(amount) {
  if (amount === null || amount === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export default function Funds() {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Nạp tiền');
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState(null);

  // VietQR state
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Poll for payment confirmation when QR is shown
  useEffect(() => {
    if (!showQR || !qrData?.paymentCode) return;

    timerRef.current = setInterval(async () => {
      try {
        const res = await api.get('/user/payments');
        const txList = res.data.data?.transactions || res.data.transactions || [];
        const newTx = txList.find(tx =>
          tx.transactionId === qrData.paymentCode &&
          tx.status === 'completed'
        );
        if (newTx) {
          clearInterval(timerRef.current);
          clearInterval(countdownRef.current);
          setQrData(null);
          setShowQR(false);
          setAmount('');
          fetchTransactions();
          try {
            const balRes = await api.get('/funds/balance');
            updateUser({ balance: balRes.data.data.balance });
          } catch {}
          showToast(`Nạp tiền thành công! +${formatVND(Math.abs(newTx.amount))}`, 'success');
        }
      } catch {
        // silent fail on poll
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showQR, qrData?.paymentCode]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/funds/transactions');
      setTransactions(response.data.data?.transactions || response.data.transactions || []);
    } catch (err) {
      console.error('Lỗi khi lấy giao dịch:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleVietQR = async () => {
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal < 10000) {
      showToast('Vui lòng nhập số tiền (tối thiểu 10,000 VND)');
      return;
    }
    setDepositLoading(true);
    try {
      const res = await api.post('/funds/deposit/sepay', { amountVND: amountVal });
      const data = res.data.data;
      setQrData(data);

      if (countdownRef.current) clearInterval(countdownRef.current);
      const expiresMs = new Date(data.expiresAt).getTime() - Date.now();
      setTimeLeft(Math.max(0, Math.floor(expiresMs / 1000)));

      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            clearInterval(timerRef.current);
            setShowQR(false);
            setQrData(null);
            showToast('Mã QR đã hết hạn, vui lòng tạo lại');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setShowQR(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể tạo mã QR');
    } finally {
      setDepositLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Không thể sao chép');
    }
  };

  const selectPreset = (val) => {
    setAmount(String(val));
    setShowQR(false);
    setQrData(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTimeLeft = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const closeQR = () => {
    setShowQR(false);
    setQrData(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const balance = user?.balance ?? 0;

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

      {/* QR Modal Overlay */}
      {showQR && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] w-full max-w-sm overflow-hidden animate-scale-in">
            {/* Close button */}
            <button
              onClick={closeQR}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#a0a0b0]" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#00d4aa]/10 to-[#6C63FF]/10 px-6 py-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/20 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-[#00d4aa]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Quét mã QR để nạp tiền</h3>
              <p className="text-2xl font-bold text-[#00d4aa]">{formatVND(qrData.amountVND)}</p>
            </div>

            {/* QR Code */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl">
                <img
                  src={qrData.qrUrl}
                  alt="Mã QR"
                  className="w-64 h-64 object-contain"
                  loading="eager"
                  decoding="sync"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-64 h-64 hidden items-center justify-center bg-gray-100 rounded-lg">
                  <span className="text-gray-500 text-sm">Không thể tải QR</span>
                </div>
              </div>

              {/* Timer */}
              <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeLeft < 60 ? 'bg-[#ff4757]/10 border border-[#ff4757]/20' : 'bg-[#ffa502]/10 border border-[#ffa502]/20'
              }`}>
                <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-[#ff4757]' : 'text-[#ffa502]'}`} />
                <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-[#ff4757]' : 'text-[#ffa502]'}`}>
                  Còn lại: {formatTimeLeft(timeLeft)}
                </span>
              </div>

              {/* Payment info */}
              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0f0f1a]">
                  <span className="text-xs text-[#6b6b80]">Ngân hàng</span>
                  <span className="text-sm font-medium text-white">{qrData.bankName}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0f0f1a]">
                  <span className="text-xs text-[#6b6b80]">Số TK</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white font-mono">{qrData.bankAccount}</span>
                    <button
                      onClick={() => copyToClipboard(qrData.bankAccount)}
                      className="p-1 rounded hover:bg-white/5 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#00d4aa]" /> : <Copy className="w-3 h-3 text-[#6b6b80]" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0f0f1a]">
                  <span className="text-xs text-[#6b6b80]">Nội dung</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#00d4aa] font-mono">{qrData.paymentCode}</span>
                    <button
                      onClick={() => copyToClipboard(qrData.paymentCode)}
                      className="p-1 rounded hover:bg-white/5 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#00d4aa]" /> : <Copy className="w-3 h-3 text-[#6b6b80]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <p className="mt-4 text-xs text-[#6b6b80] text-center">
                Quét QR trên ứng dụng ngân hàng hoặc VietQR<br/>
                Vui lòng nhập đúng <span className="text-[#00d4aa] font-medium">nội dung: {qrData.paymentCode}</span>
              </p>

              {qrData.qrDownloadUrl && (
                <a
                  href={qrData.qrDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs text-[#00d4aa] hover:underline"
                >
                  Mở ảnh QR gốc (nếu app ngân hàng không nhận trong modal)
                </a>
              )}

              {/* Polling indicator */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[#6b6b80]">
                <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                <span>Đang chờ thanh toán...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tài chính</h1>
        <p className="text-sm text-[#a0a0b0]">Quản lý số dư và lịch sử giao dịch</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00d4aa]/20 via-[#1a1a2e] to-[#6C63FF]/10 border border-[#2d2d44] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4aa]/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2" />
        <div className="relative flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#00d4aa]/20 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <div>
            <p className="text-sm text-[#a0a0b0] mb-1">Số dư khả dụng</p>
            <p className="text-4xl font-bold text-white">{formatVND(balance)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a2e] rounded-xl p-1 border border-[#2d2d44]">
        {['Nạp tiền', 'Lịch sử'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab
                ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20'
                : 'text-[#a0a0b0] hover:text-white'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Nạp tiền' && (
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2d2d44]">
            <CreditCard className="w-4 h-4 text-[#6C63FF]" />
            <h3 className="font-semibold text-white">Nạp tiền</h3>
          </div>
          <div className="p-5 space-y-6">
            {/* Amount Presets */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-3">
                Chọn số tiền
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AMOUNT_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => selectPreset(val)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all
                      ${parseFloat(amount) === val
                        ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25'
                        : 'bg-white/5 text-[#a0a0b0] hover:text-white hover:bg-white/10 border border-[#2d2d44]'
                      }
                    `}
                  >
                    {formatVND(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b80] font-medium">VND</span>
              <input
                type="number"
                placeholder="Số tiền tùy chỉnh..."
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setShowQR(false);
                  setQrData(null);
                  if (countdownRef.current) clearInterval(countdownRef.current);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                className="w-full pl-16 pr-4 py-3 rounded-xl bg-[#0f0f1a] border border-[#2d2d44] text-white text-lg placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF]"
                min="10000"
                step="1000"
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#a0a0b0]">Phương thức thanh toán</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleVietQR}
                  disabled={depositLoading}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#00d4aa]/30 bg-[#00d4aa]/5 hover:bg-[#00d4aa]/10 transition-all text-left relative"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">VietQR</p>
                    <p className="text-xs text-[#6b6b80]">Quét QR, tự động xác nhận</p>
                  </div>
                  {depositLoading && (
                    <div className="absolute top-2 right-2 w-4 h-4 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </div>

            {amount && (
              <div className="p-4 rounded-xl bg-[#00d4aa]/5 border border-[#00d4aa]/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a0a0b0]">Bạn sẽ nạp</span>
                  <span className="text-xl font-bold text-[#00d4aa]">{formatVND(parseFloat(amount) || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Lịch sử' && (
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl overflow-hidden">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d2d44]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Ngày</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Loại</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Số tiền</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id || tx.id} className="border-b border-[#2d2d44]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs text-[#6b6b80]">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {tx.type === 'deposit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-[#00d4aa]" />
                          ) : tx.type === 'withdrawal' ? (
                            <ArrowUpRight className="w-4 h-4 text-[#ffa502]" />
                          ) : (
                            <Plus className="w-4 h-4 text-[#6C63FF]" />
                          )}
                          <span className="text-xs capitalize text-[#a0a0b0]">
                            {tx.type === 'deposit' ? 'Nạp tiền' : tx.type === 'withdrawal' ? 'Rút tiền' : tx.type || 'Khác'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-sm ${
                        tx.type === 'deposit' ? 'text-[#00d4aa]' : 'text-white'
                      }`}>
                        {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}{formatVND(Math.abs(tx.amount))}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6b6b80]">
                        {tx.description || tx.note || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Wallet className="w-12 h-12 mx-auto text-[#6b6b80] mb-3" />
              <p className="text-[#a0a0b0]">Chưa có giao dịch nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
