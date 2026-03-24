import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Info, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

export default function NewOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    service: '',
    link: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data?.services || []);
      if (location.state?.serviceId) {
        setForm((p) => ({ ...p, service: location.state.serviceId }));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => String(s._id) === String(form.service));

  const charge = selectedService && form.quantity
    ? Math.round((parseFloat(form.quantity) / 1000) * selectedService.pricePer1k)
    : 0;

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.service) newErrors.service = 'Vui lòng chọn một dịch vụ';
    if (!form.link) newErrors.link = 'Vui lòng nhập link';
    if (!form.quantity) {
      newErrors.quantity = 'Vui lòng nhập số lượng';
    } else {
      const qty = parseInt(form.quantity);
      if (selectedService) {
        if (qty < selectedService.minOrder) {
          newErrors.quantity = `Số lượng tối thiểu là ${selectedService.minOrder}`;
        }
        if (qty > selectedService.maxOrder) {
          newErrors.quantity = `Số lượng tối đa là ${selectedService.maxOrder}`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    try {
      await api.post('/orders', {
        serviceId: form.service,
        link: form.link,
        quantity: parseInt(form.quantity),
      });
      showToast('Đặt hàng thành công!', 'success');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đặt hàng thất bại';
      showToast(msg);
    } finally {
      setPlacing(false);
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
    <div className="max-w-3xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold text-white mb-1">Đặt hàng mới</h1>
        <p className="text-sm text-[#a0a0b0]">Đặt hàng dịch vụ SMM ngay</p>
      </div>

      {/* Order Form */}
      <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2d2d44]">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <h3 className="font-semibold text-white">Thông tin đơn hàng</h3>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Select */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Dịch vụ</label>
              <select
                value={form.service}
                onChange={(e) => {
                  setForm((p) => ({ ...p, service: e.target.value }));
                  setErrors((p) => ({ ...p, service: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border ${errors.service ? 'border-[#ff4757]' : 'border-[#2d2d44]'} text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all`}
              >
                <option value="">Chọn dịch vụ...</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {formatCurrency(s.pricePer1k)}/1k
                  </option>
                ))}
              </select>
              {errors.service && <p className="text-xs text-[#ff4757] mt-1">{errors.service}</p>}
            </div>

            {selectedService && (
              <div className="px-4 py-3 rounded-lg bg-[#6C63FF]/5 border border-[#6C63FF]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#6C63FF]" />
                  <span className="text-sm font-medium text-[#a09af9]">Chi tiết dịch vụ</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#6b6b80]">Tối thiểu:</span>
                    <span className="ml-1 text-white font-medium">{selectedService.minOrder}</span>
                  </div>
                  <div>
                    <span className="text-[#6b6b80]">Tối đa:</span>
                    <span className="ml-1 text-white font-medium">{selectedService.maxOrder?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#6b6b80]">Giá:</span>
                    <span className="ml-1 text-[#00d4aa] font-medium">{formatCurrency(selectedService.pricePer1k)}/1k</span>
                  </div>
                  <div>
                    <span className="text-[#6b6b80]">Thời gian:</span>
                    <span className="ml-1 text-white font-medium">{selectedService.averageTime || '~24h'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Link Input */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Link</label>
              <input
                type="text"
                placeholder="https://instagram.com/p/ABC123 hoac @username"
                value={form.link}
                onChange={(e) => {
                  setForm((p) => ({ ...p, link: e.target.value }));
                  setErrors((p) => ({ ...p, link: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border ${errors.link ? 'border-[#ff4757]' : 'border-[#2d2d44]'} text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all`}
              />
              {errors.link && <p className="text-xs text-[#ff4757] mt-1">{errors.link}</p>}
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Số lượng</label>
              <input
                type="number"
                placeholder="Nhập số lượng"
                value={form.quantity}
                onChange={(e) => {
                  setForm((p) => ({ ...p, quantity: e.target.value }));
                  setErrors((p) => ({ ...p, quantity: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border ${errors.quantity ? 'border-[#ff4757]' : 'border-[#2d2d44]'} text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all`}
              />
              {selectedService && (
                <p className="text-xs text-[#6b6b80] mt-1">
                  Tối thiểu: {selectedService.minOrder} / Tối đa: {selectedService.maxOrder?.toLocaleString()}
                </p>
              )}
              {errors.quantity && <p className="text-xs text-[#ff4757] mt-1">{errors.quantity}</p>}
            </div>

            {/* Charge Calculation */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#00d4aa]/10 to-[#6C63FF]/10 border border-[#2d2d44]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-sm text-[#a0a0b0]">Tổng chi phí</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatCurrency(parseFloat(charge))}</p>
                  <p className="text-xs text-[#6b6b80]">
                    {form.quantity ? `${form.quantity} x ${formatCurrency(selectedService?.pricePer1k || 0)}/1k` : '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={placing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#7a73ff] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-lg shadow-[#6C63FF]/20"
              >
                {placing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )} Đặt hàng
              </button>
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d2d44] text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/30 text-sm font-medium transition-all"
              >
                Xem dịch vụ <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl">
        <div className="px-5 py-4 border-b border-[#2d2d44]">
          <h3 className="font-semibold text-white">Hướng dẫn đặt hàng</h3>
        </div>
        <div className="p-5">
          <ul className="space-y-2 text-sm text-[#a0a0b0]">
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">1.</span>
              <span>Chọn dịch vụ từ menu thao tác</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">2.</span>
              <span>Nhập đường dẫn đầy đủ hoặc username của tài khoản/post muốn tăng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">3.</span>
              <span>Nhập số lượng cần đặt (trong phạm vi tối thiểu/tối đa)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">4.</span>
              <span>Kiểm tra tổng chi phí và nhấn "Đặt hàng"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa502] mt-0.5">Lưu ý:</span>
              <span>Đơn hàng đã đặt không thể hủy hoặc hoàn tiền.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
