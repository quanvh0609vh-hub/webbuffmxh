import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, Clock, Shield, UserPlus, Package } from 'lucide-react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import StatsCard from '../../components/StatsCard';
import Spinner from '../../components/Spinner';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import api from '../../services/api';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data?.stats || response.data.stats || {});
      setRecentUsers(response.data.data?.recentUsers || response.data.recentUsers || []);
      setRecentOrders(response.data.data?.recentOrders || response.data.recentOrders || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setStats(DEMO_STATS);
      setRecentUsers(DEMO_USERS);
      setRecentOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Bảng điều khiển quản trị</h2>
          <p className="text-sm text-text-secondary">Tổng quan toàn bộ nền tảng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Tổng người dùng" value={formatNumber(stats.users)} color="accent" />
        <StatsCard icon={ShoppingCart} label="Tổng đơn hàng" value={formatNumber(stats.orders)} color="teal" />
        <StatsCard icon={DollarSign} label="Tổng doanh thu" value={formatCurrency(stats.revenue)} color="teal" />
        <StatsCard icon={Clock} label="Đơn chờ xử lý" value={formatNumber(stats.pending)} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-white">Đăng ký gần đây</h3>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {recentUsers.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.Th>Người dùng</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Ngày tham gia</Table.Th>
                </Table.Head>
                <Table.Body>
                  {recentUsers.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell className="text-white font-medium">{user.username}</Table.Cell>
                      <Table.Cell className="text-xs">{user.email}</Table.Cell>
                      <Table.Cell className="text-xs">{formatDate(user.createdAt)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">Chưa có người dùng nào</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Recent Orders */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-white">Đơn hàng gần đây</h3>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {recentOrders.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Người dùng</Table.Th>
                  <Table.Th>Số tiền</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                </Table.Head>
                <Table.Body>
                  {recentOrders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell className="font-mono text-xs text-accent">
                        #{order.id?.slice(-6)}
                      </Table.Cell>
                      <Table.Cell className="text-xs">{order.user?.username || 'N/A'}</Table.Cell>
                      <Table.Cell className="text-teal font-medium">
                        {formatCurrency(order.charge || 0)}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge status={order.status}>{order.status}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">Chưa có đơn hàng nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

const DEMO_STATS = { users: 1542, orders: 24891, revenue: 45823.50, pending: 23 };
const DEMO_USERS = [
  { id: 1, username: 'johndoe', email: 'john@example.com', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, username: 'socialpro', email: 'social@example.com', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, username: 'marketer123', email: 'mark@example.com', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, username: 'influencer', email: 'inf@example.com', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 5, username: 'business_acc', email: 'biz@example.com', createdAt: new Date(Date.now() - 18000000).toISOString() },
];
const DEMO_ORDERS = [
  { id: 'ord_abc123', user: { username: 'johndoe' }, charge: 15.99, status: 'completed' },
  { id: 'ord_def456', user: { username: 'socialpro' }, charge: 8.50, status: 'processing' },
  { id: 'ord_ghi789', user: { username: 'marketer123' }, charge: 25.00, status: 'pending' },
  { id: 'ord_jkl012', user: { username: 'influencer' }, charge: 12.75, status: 'completed' },
  { id: 'ord_mno345', user: { username: 'business_acc' }, charge: 5.99, status: 'cancelled' },
];
