import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ShoppingCart, Clock, CheckCircle, ArrowRight, Plus, Zap, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [quickOrder, setQuickOrder] = useState({ service: '', link: '', quantity: '' });
  const [services, setServices] = useState([]);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes, servicesRes] = await Promise.all([
        api.get('/orders?limit=5'),
        api.get('/orders/stats'),
        api.get('/services'),
      ]);
      setOrders(ordersRes.data?.data?.orders || []);
      setStats(statsRes.data?.data?.stats || { totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0 });
      setServices(servicesRes.data?.data?.services || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setOrders([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOrder = async (e) => {
    e.preventDefault();
    if (!quickOrder.service || !quickOrder.link || !quickOrder.quantity) return;
    setPlacing(true);
    try {
      await api.post('/orders', {
        serviceId: quickOrder.service,
        link: quickOrder.link,
        quantity: parseInt(quickOrder.quantity),
      });
      setQuickOrder({ service: '', link: '', quantity: '' });
      fetchData();
      navigate('/orders');
    } catch (err) {
      console.error('Quick order failed:', err);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
      </div>
    );
  }

  const activeOrders = stats.pendingOrders + stats.processingOrders;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6C63FF]/20 via-[#1a1a2e] to-[#00d4aa]/10 border border-[#2d2d44]/50 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C63FF]/10 rounded-full blur-[64px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white mb-1">
            Xin chào, {user?.username || 'User'}!
          </h2>
          <p className="text-[#a0a0b0] text-sm">
            Số dư hiện tại:{' '}
            <span className="text-[#00d4aa] font-semibold">{formatCurrency(user?.balance || 0)}</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#00d4aa]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(user?.balance || 0)}</div>
          <div className="text-[#a0a0b0] text-xs mt-1">Số dư</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#6C63FF]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
          <div className="text-[#a0a0b0] text-xs mt-1">Tổng đơn</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffa502]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#ffa502]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{activeOrders}</div>
          <div className="text-[#a0a0b0] text-xs mt-1">Đơn đang xử lý</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#00d4aa]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.completedOrders}</div>
          <div className="text-[#a0a0b0] text-xs mt-1">Hoàn thành</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#1a1a2e] border border-[#2d2d44] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2d2d44] flex items-center justify-between">
            <h3 className="font-semibold text-white">Đơn gần đây</h3>
            <Link to="/orders" className="text-sm text-[#6C63FF] hover:text-[#8b85ff] flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-0">
            {orders.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-[#a0a0b0] text-xs border-b border-[#2d2d44]">
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Dịch vụ</th>
                    <th className="text-left px-4 py-3">Trạng thái</th>
                    <th className="text-left px-4 py-3">Số tiền</th>
                    <th className="text-left px-4 py-3">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#2d2d44]/50 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigate('/orders')}>
                      <td className="px-4 py-3 text-xs font-mono text-[#a0a0b0]">{order.orderId || order.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{order.service?.name || order.link}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'Completed' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' :
                          order.status === 'Processing' ? 'bg-[#ffa502]/10 text-[#ffa502]' :
                          order.status === 'Pending' ? 'bg-[#6C63FF]/10 text-[#6C63FF]' :
                          'bg-[#ff4757]/10 text-[#ff4757]'
                        }`}>{order.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#00d4aa] font-medium">{formatCurrency(order.charge || 0)}</td>
                      <td className="px-4 py-3 text-xs text-[#a0a0b0]">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-[#6b6b80] mb-3" />
                <p className="text-[#a0a0b0]">Chưa có đơn hàng nào</p>
                <Link to="/order/new">
                  <button className="mt-3 px-4 py-2 rounded-lg border border-[#6C63FF]/30 text-[#6C63FF] hover:bg-[#6C63FF]/10 text-sm transition-all">
                    Đặt đơn đầu tiên
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Order */}
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2d2d44] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#6C63FF]" />
            <h3 className="font-semibold text-white">Đặt hàng nhanh</h3>
          </div>
          <div className="p-4">
            <form onSubmit={handleQuickOrder} className="space-y-3">
              <div>
                <label className="block text-xs text-[#a0a0b0] mb-1.5">Dịch vụ</label>
                <select
                  value={quickOrder.service}
                  onChange={(e) => setQuickOrder((p) => ({ ...p, service: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id} className="bg-[#0f0f1a]">
                      {s.name} - {formatCurrency(s.pricePer1k)}/1k
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#a0a0b0] mb-1.5">Link</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={quickOrder.link}
                  onChange={(e) => setQuickOrder((p) => ({ ...p, link: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#a0a0b0] mb-1.5">Số lượng</label>
                <input
                  type="number"
                  placeholder="100"
                  value={quickOrder.quantity}
                  onChange={(e) => setQuickOrder((p) => ({ ...p, quantity: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
                />
              </div>
              {quickOrder.service && quickOrder.quantity && (
                <div className="px-3 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-sm">
                  <span className="text-[#a0a0b0]">Tổng tiền: </span>
                  <span className="text-[#00d4aa] font-semibold">
                    {formatCurrency((parseInt(quickOrder.quantity) / 1000) * (services.find(s => s._id === quickOrder.service)?.pricePer1k || 0))}
                  </span>
                </div>
              )}
              <button
                type="submit"
                disabled={placing || !quickOrder.service || !quickOrder.link || !quickOrder.quantity}
                className="w-full px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing ? 'Đang xử lý...' : <><Plus className="w-4 h-4" /> Đặt hàng</>}
              </button>
              <Link to="/order/new" className="block text-center">
                <button type="button" className="w-full px-4 py-2 rounded-lg text-[#a0a0b0] hover:text-white text-sm transition-all">
                  Đặt hàng nâng cao →
                </button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
