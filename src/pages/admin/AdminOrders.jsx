import { useState, useEffect } from 'react';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Đang chờ' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'failed', label: 'Thất bại' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [updating, setUpdating] = useState(null);
  const perPage = 15;
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await api.get('/admin/orders', { params });
      setOrders(response.data.data?.orders || response.data.orders || []);
      setTotalPages(response.data.data?.totalPages || response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders(DEMO_ORDERS);
      setTotalPages(2);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setDetailModal(true);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const response = await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Cập nhật trạng thái thành công`);
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quản lý đơn hàng</h2>
            <p className="text-sm text-text-secondary">{orders.length} đơn hàng</p>
          </div>
        </div>
        <Button variant="secondary" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" /> Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-1 flex-wrap flex-1">
              <button
                onClick={() => { setStatusFilter(''); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!statusFilter ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:text-white'}`}
              >
                Tất cả
              </button>
              {['pending', 'processing', 'completed', 'cancelled'].map((s) => {
                const labels = { pending: 'Đang chờ', processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
                return (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:text-white'}`}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID hoặc link..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1a1a2e] border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-16"><Spinner size="lg" /></div>
          ) : orders.length > 0 ? (
            <>
              <Table>
                <Table.Head>
                  <Table.Th>ID Đơn</Table.Th>
                  <Table.Th>Người dùng</Table.Th>
                  <Table.Th>Dịch vụ</Table.Th>
                  <Table.Th>Link</Table.Th>
                  <Table.Th>SL</Table.Th>
                  <Table.Th>Chi phí</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>Ngày</Table.Th>
                  <Table.Th>Hành động</Table.Th>
                </Table.Head>
                <Table.Body>
                  {orders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell className="font-mono text-xs text-accent">
                        #{order.id?.slice(-8)}
                      </Table.Cell>
                      <Table.Cell className="text-xs">{order.user?.username || 'N/A'}</Table.Cell>
                      <Table.Cell className="text-white font-medium text-xs max-w-[120px] truncate">
                        {order.service?.name || 'N/A'}
                      </Table.Cell>
                      <Table.Cell className="text-xs max-w-[150px] truncate">
                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light" onClick={(e) => e.stopPropagation()}>
                          {order.link?.slice(0, 30)}...
                        </a>
                      </Table.Cell>
                      <Table.Cell>{order.quantity?.toLocaleString()}</Table.Cell>
                      <Table.Cell className="text-teal font-medium">{formatCurrency(order.charge || 0)}</Table.Cell>
                      <Table.Cell>
                        <Badge status={order.status}>{order.status}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs">{formatDateTime(order.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetail(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-text-muted">Trang {page} / {totalPages}</p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let num = i + 1;
                      if (totalPages > 5 && page > 3) num = page - 2 + i;
                      if (totalPages > 5 && page > totalPages - 2) num = totalPages - 4 + i;
                      return (
                        <Button key={num} variant={page === num ? 'primary' : 'ghost'} size="icon" onClick={() => setPage(num)}>
                          {num}
                        </Button>
                      );
                    })}
                    <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary">Không tìm thấy đơn hàng nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Chi tiết đơn hàng" size="md">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-text-muted">ID Đơn</p>
                <p className="text-sm font-mono text-accent">#{selectedOrder.id?.slice(-8)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Người dùng</p>
                <p className="text-sm text-white">{selectedOrder.user?.username || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Dịch vụ</p>
                <p className="text-sm text-white">{selectedOrder.service?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Số lượng</p>
                <p className="text-sm text-white">{selectedOrder.quantity?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Chi phí</p>
                <p className="text-sm text-teal font-semibold">{formatCurrency(selectedOrder.charge || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Ngày</p>
                <p className="text-sm text-white">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-text-muted">Link</p>
                <a href={selectedOrder.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent break-all">
                  {selectedOrder.link}
                </a>
              </div>
            </div>

            {/* Update Status */}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">Cập nhật trạng thái</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={selectedOrder.status === opt.value ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => updateStatus(selectedOrder.id, opt.value)}
                    loading={updating === selectedOrder.id}
                    disabled={selectedOrder.status === opt.value}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const DEMO_ORDERS = [
  { id: 'ord_abc123def456', user: { username: 'johndoe' }, service: { name: 'Instagram Followers' }, link: 'https://instagram.com/p/ABC123', quantity: 500, charge: 7.50, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ord_bcd234efg567', user: { username: 'socialpro' }, service: { name: 'YouTube Views' }, link: 'https://youtube.com/watch?v=xyz789', quantity: 5000, charge: 25.00, status: 'processing', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ord_cde345fgh678', user: { username: 'marketer123' }, service: { name: 'TikTok Likes' }, link: 'https://tiktok.com/@user/video/123', quantity: 1000, charge: 20.00, status: 'pending', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'ord_def456ghi789', user: { username: 'influencer' }, service: { name: 'Telegram Members' }, link: 'https://t.me/channelname', quantity: 200, charge: 6.00, status: 'completed', createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 'ord_efg567hij890', user: { username: 'business_acc' }, service: { name: 'Twitter Retweets' }, link: 'https://twitter.com/user/status/123', quantity: 250, charge: 4.50, status: 'cancelled', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 'ord_fgh678ijk901', user: { username: 'johndoe' }, service: { name: 'Facebook Page Likes' }, link: 'https://facebook.com/page123', quantity: 100, charge: 2.50, status: 'completed', createdAt: new Date(Date.now() - 518400000).toISOString() },
];
