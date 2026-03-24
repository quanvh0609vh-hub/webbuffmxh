import { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Edit, Shield, UserX } from 'lucide-react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Spinner from '../../components/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', balance: '', role: '' });
  const [saving, setSaving] = useState(false);
  const perPage = 15;
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data?.users || response.data.users || []);
      setTotalPages(response.data.data?.totalPages || response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers(DEMO_USERS);
      setTotalPages(3);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      balance: String(user.balance || 0),
      role: user.role || 'user',
    });
    setEditModal(true);
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        username: editForm.username,
        email: editForm.email,
        balance: parseFloat(editForm.balance),
        role: editForm.role,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...editForm, balance: parseFloat(editForm.balance) }
            : u
        )
      );
      setEditModal(false);
      toast.success('Cập nhật người dùng thành công');
    } catch (err) {
      toast.error('Cập nhật người dùng thất bại');
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await api.put(`/admin/users/${user.id}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      toast.success(`Đã ${newRole === 'admin' ? 'thăng cấp' : 'hạ cấp'} thành ${newRole === 'admin' ? 'quản trị viên' : 'người dùng'}`);
    } catch (err) {
      toast.error('Cập nhật vai trò thất bại');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quản lý người dùng</h2>
            <p className="text-sm text-text-secondary">{users.length} người dùng</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <Card.Body>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-border text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Th>Người dùng</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Số dư</Table.Th>
                  <Table.Th>Đơn hàng</Table.Th>
                  <Table.Th>Vai trò</Table.Th>
                  <Table.Th>Ngày tham gia</Table.Th>
                  <Table.Th>Hành động</Table.Th>
                </Table.Head>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell className="text-white font-medium">{user.username}</Table.Cell>
                      <Table.Cell className="text-xs">{user.email}</Table.Cell>
                      <Table.Cell className="text-teal font-medium">{formatCurrency(user.balance || 0)}</Table.Cell>
                      <Table.Cell className="text-xs">{user.orderCount || 0}</Table.Cell>
                      <Table.Cell>
                        <Badge status={user.role}>{user.role}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs">{formatDate(user.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleAdmin(user)}>
                            {user.role === 'admin' ? (
                              <UserX className="w-4 h-4 text-warning" />
                            ) : (
                              <Shield className="w-4 h-4 text-accent" />
                            )}
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
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Sửa người dùng" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <Input label="Người dùng" value={editForm.username} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} />
            <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            <Input label="Số dư" type="number" value={editForm.balance} onChange={(e) => setEditForm((p) => ({ ...p, balance: e.target.value }))} />
            <Select
              label="Vai trò"
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={editForm.role}
              onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
            />
            <div className="flex gap-3 pt-2">
              <Button onClick={saveUser} loading={saving} className="flex-1">Lưu thay đổi</Button>
              <Button variant="secondary" onClick={() => setEditModal(false)}>Hủy</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const DEMO_USERS = [
  { id: 1, username: 'johndoe', email: 'john@example.com', balance: 125.50, role: 'user', orderCount: 47, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, username: 'socialpro', email: 'social@example.com', balance: 89.00, role: 'user', orderCount: 23, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, username: 'marketer123', email: 'mark@example.com', balance: 210.75, role: 'user', orderCount: 89, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 4, username: 'influencer', email: 'inf@example.com', balance: 54.25, role: 'user', orderCount: 12, createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 5, username: 'business_acc', email: 'biz@example.com', balance: 0, role: 'user', orderCount: 0, createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 6, username: 'admin', email: 'admin@webbuffmxh.com', balance: 0, role: 'admin', orderCount: 0, createdAt: new Date(Date.now() - 864000000).toISOString() },
];
