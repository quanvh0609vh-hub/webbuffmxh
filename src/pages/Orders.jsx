import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/format';

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS = {
  pending: 'Đang chờ',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const perPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (activeTab !== 'All') params.status = activeTab.toLowerCase();
      if (search) params.search = search;
      const response = await api.get('/orders', { params });
      setOrders(response.data.data?.orders || response.data.orders || []);
      setTotalPages(response.data.data?.totalPages || response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Đơn hàng của tôi</h1>
          <p className="text-sm text-[#a0a0b0]">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${activeTab === tab
                    ? 'bg-[#6C63FF] text-white'
                    : 'bg-white/5 text-[#a0a0b0] hover:text-white'
                  }
                `}
              >
                {tab === 'All' ? 'Tất cả' : STATUS_LABELS[tab.toLowerCase()] || tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID đơn hoặc link..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-[#2d2d44] text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/30 text-sm font-medium transition-all"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d2d44]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">ID Đơn hàng</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Dịch vụ</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Link</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Số lượng</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Chi phí</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]">Ngày</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b80]"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-[#2d2d44]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#6C63FF]">
                        #{order.orderId?.slice(-8) || order._id?.slice(-8) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-xs max-w-[120px] truncate">
                        {order.service?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[150px] truncate">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6C63FF] hover:text-[#a09af9] truncate block max-w-[150px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.link?.slice(0, 30)}...
                        </a>
                      </td>
                      <td className="px-4 py-3 font-medium text-white text-sm">
                        {order.quantity?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-[#00d4aa] font-medium text-sm">
                        {formatCurrency(order.charge || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[order.status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {STATUS_LABELS[order.status?.toLowerCase()] || order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6b6b80]">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(order)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#2d2d44]">
                <p className="text-xs text-[#6b6b80]">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page > 3) pageNum = page - 2 + i;
                      if (page > totalPages - 2) pageNum = totalPages - 4 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          page === pageNum
                            ? 'bg-[#6C63FF] text-white'
                            : 'hover:bg-white/5 text-[#a0a0b0]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <Search className="w-12 h-12 mx-auto text-[#6b6b80] mb-3" />
            <p className="text-[#a0a0b0]">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d44]">
              <h3 className="font-semibold text-white">Chi tiết đơn hàng</h3>
              <button
                onClick={() => setDetailModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[#6b6b80] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">ID Đơn hàng</p>
                  <p className="text-sm font-mono text-[#6C63FF]">
                    #{selectedOrder.orderId?.slice(-8) || selectedOrder._id?.slice(-8)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">Trạng thái</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[selectedOrder.status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {STATUS_LABELS[selectedOrder.status?.toLowerCase()] || selectedOrder.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">Dịch vụ</p>
                  <p className="text-sm text-white">{selectedOrder.service?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">Số lượng</p>
                  <p className="text-sm text-white">{selectedOrder.quantity?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">Chi phí</p>
                  <p className="text-sm text-[#00d4aa] font-semibold">{formatCurrency(selectedOrder.charge || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#6b6b80]">Ngày tạo</p>
                  <p className="text-sm text-white">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-[#6b6b80]">Link</p>
                  <a
                    href={selectedOrder.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6C63FF] hover:text-[#a09af9] break-all"
                  >
                    {selectedOrder.link}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
