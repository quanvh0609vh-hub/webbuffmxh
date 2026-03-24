import { useState, useEffect } from 'react';
import { Grid3x3, Search, Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/format';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const CATEGORIES = ['All', 'Telegram', 'YouTube', 'TikTok', 'Instagram', 'Facebook', 'Twitter', 'Spotify'];

const emptyService = {
  name: '',
  category: 'Instagram',
  description: '',
  price: '',
  min: '',
  max: '',
  avgTime: '',
  active: true,
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      const raw = response.data.data?.services || response.data.services || [];
      // Normalize: server returns _id, client uses id
      setServices(raw.map(s => ({ ...s, id: s._id || s.id })));
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices(DEMO_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openEdit = (service) => {
    setSelectedService(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: String(service.pricePer1k || service.price || ''),
      min: String(service.minOrder || service.min || ''),
      max: String(service.maxOrder || service.max || ''),
      avgTime: service.averageTime || service.avgTime || '',
      active: service.status === 'active' || service.active !== false,
    });
    setEditModal(true);
  };

  const openAdd = () => {
    setForm(emptyService);
    setAddModal(true);
  };

  const saveService = async () => {
    setSaving(true);
    const data = {
      name: form.name,
      category: form.category,
      description: form.description,
      pricePer1k: parseFloat(form.price),
      minOrder: parseInt(form.min),
      maxOrder: parseInt(form.max),
      averageTime: form.avgTime,
      status: form.active ? 'active' : 'inactive',
    };
    try {
      if (selectedService) {
        const response = await api.put(`/admin/services/${selectedService.id}`, data);
        const updated = response.data.data?.service || response.data.data;
        setServices((prev) =>
          prev.map((s) => (s.id === selectedService.id ? { ...s, ...updated } : s))
        );
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        const response = await api.post('/admin/services', data);
        const newService = response.data.data?.service || response.data.data;
        setServices((prev) => [...prev, { ...newService, id: newService._id }]);
        toast.success('Tạo dịch vụ thành công');
      }
      setEditModal(false);
      setAddModal(false);
    } catch (err) {
      toast.error('Lưu dịch vụ thất bại');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service) => {
    try {
      const newStatus = (service.status === 'active' || service.active !== false) ? 'inactive' : 'active';
      await api.put(`/admin/services/${service.id}`, { status: newStatus });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, status: newStatus } : s))
      );
      toast.success(`Đã ${newStatus === 'active' ? 'bật' : 'tắt'} dịch vụ`);
    } catch (err) {
      toast.error('Thay đổi trạng thái dịch vụ thất bại');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Grid3x3 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quản lý dịch vụ</h2>
            <p className="text-sm text-text-secondary">{services.length} dịch vụ</p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" /> Thêm dịch vụ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-accent text-white' : 'bg-card border border-border text-text-secondary hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-16"><Spinner size="lg" /></div>
          ) : filtered.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Th>Tên</Table.Th>
                <Table.Th>Danh mục</Table.Th>
                <Table.Th>Giá</Table.Th>
                <Table.Th>Tối thiểu</Table.Th>
                <Table.Th>Tối đa</Table.Th>
                <Table.Th>Thời gian</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th>Hành động</Table.Th>
              </Table.Head>
              <Table.Body>
                {filtered.map((service) => (
                  <Table.Row key={service.id}>
                    <Table.Cell className="text-white font-medium text-xs max-w-[200px] truncate">
                      {service.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge status={service.category}>{service.category}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-teal font-medium">
                      {formatCurrency(service.pricePer1k || service.price)}
                    </Table.Cell>
                    <Table.Cell>{service.minOrder || service.min}</Table.Cell>
                    <Table.Cell>{(service.maxOrder || service.max)?.toLocaleString()}</Table.Cell>
                    <Table.Cell className="text-xs">{service.averageTime || service.avgTime || '~24h'}</Table.Cell>
                    <Table.Cell>
                      <Badge status={service.status === 'active' || service.active !== false ? 'active' : 'inactive'}>
                        {service.status === 'active' || service.active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(service)}>
                          {service.status === 'active' || service.active !== false ? (
                            <ToggleRight className="w-5 h-5 text-teal" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-text-muted" />
                          )}
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="py-16 text-center">
              <Grid3x3 className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary">Không tìm thấy dịch vụ nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={editModal || addModal}
        onClose={() => { setEditModal(false); setAddModal(false); }}
        title={selectedService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Tên dịch vụ" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Followers Instagram" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Danh mục"
              options={CATEGORIES.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            />
            <Input label="Thời gian giao hàng" value={form.avgTime} onChange={(e) => setForm((p) => ({ ...p, avgTime: e.target.value }))} placeholder="VD: ~12h" />
          </div>
          <Input label="Mô tả" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả dịch vụ..." />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Giá (cho 1k)" type="number" step="0.001" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <Input label="SL tối thiểu" type="number" value={form.min} onChange={(e) => setForm((p) => ({ ...p, min: e.target.value }))} />
            <Input label="SL tối đa" type="number" value={form.max} onChange={(e) => setForm((p) => ({ ...p, max: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 rounded border-border bg-[#1a1a2e] text-accent focus:ring-accent/50"
            />
            <span className="text-sm text-text-secondary">Dịch vụ đang hoạt động</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={saveService} loading={saving} className="flex-1">{selectedService ? 'Lưu thay đổi' : 'Tạo dịch vụ'}</Button>
            <Button variant="secondary" onClick={() => { setEditModal(false); setAddModal(false); }}>Hủy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const DEMO_SERVICES = [
  { id: 1, name: 'Instagram Followers - High Quality', category: 'Instagram', price: 0.015, min: 10, max: 10000, avgTime: '~12h', active: true },
  { id: 2, name: 'YouTube Views - Real Users', category: 'YouTube', price: 0.005, min: 100, max: 100000, avgTime: '~6h', active: true },
  { id: 3, name: 'TikTok Followers - Fast Delivery', category: 'TikTok', price: 0.02, min: 50, max: 50000, avgTime: '~3h', active: true },
  { id: 4, name: 'Telegram Channel Members', category: 'Telegram', price: 0.03, min: 100, max: 50000, avgTime: '~24h', active: true },
  { id: 5, name: 'Facebook Page Likes', category: 'Facebook', price: 0.025, min: 50, max: 20000, avgTime: '~18h', active: false },
  { id: 6, name: 'Twitter Followers - Premium', category: 'Twitter', price: 0.018, min: 100, max: 10000, avgTime: '~8h', active: true },
  { id: 7, name: 'Spotify Followers', category: 'Spotify', price: 0.022, min: 20, max: 50000, avgTime: '~12h', active: true },
];
