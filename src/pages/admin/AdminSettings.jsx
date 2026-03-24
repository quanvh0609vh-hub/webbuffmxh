import { useState, useEffect } from 'react';
import { Settings, Save, Database, AlertTriangle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'webbuffMXH',
    siteUrl: 'https://webbuffmxh.com',
    supportEmail: 'support@webbuffmxh.com',
    minDeposit: '5',
    minOrder: '1',
    referralBonus: '5',
    maintenanceMode: false,
  });
  const toast = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const data = response.data.data?.settings || response.data.settings || settings;
      setSettings({ ...settings, ...data });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', {
        siteName: settings.siteName,
        siteUrl: settings.siteUrl,
        supportEmail: settings.supportEmail,
        minDeposit: parseFloat(settings.minDeposit),
        minOrder: parseFloat(settings.minOrder),
        referralBonus: parseFloat(settings.referralBonus),
        maintenanceMode: settings.maintenanceMode,
      });
      toast.success('Lưu cài đặt thành công');
    } catch (err) {
      toast.error('Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const seedData = async () => {
    if (!window.confirm('Thao tác này sẽ tạo dữ liệu mẫu (dịch vụ, người dùng, đơn hàng). Tiếp tục?')) return;
    setSeeding(true);
    try {
      await api.post('/admin/seed');
      toast.success('Tạo dữ liệu mẫu thành công');
    } catch (err) {
      toast.error('Tạo dữ liệu mẫu thất bại');
    } finally {
      setSeeding(false);
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
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Cài đặt trang web</h2>
          <p className="text-sm text-text-secondary">Cấu hình cài đặt nền tảng của bạn</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold text-white">Cài đặt chung</h3>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên trang web"
              value={settings.siteName}
              onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))}
              placeholder="webbuffMXH"
            />
            <Input
              label="URL trang web"
              value={settings.siteUrl}
              onChange={(e) => setSettings((p) => ({ ...p, siteUrl: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          <Input
            label="Email hỗ trợ"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))}
            placeholder="support@example.com"
          />
        </Card.Body>
      </Card>

      {/* Transaction Settings */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold text-white">Cài đặt giao dịch</h3>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nạp tối thiểu ($)"
              type="number"
              value={settings.minDeposit}
              onChange={(e) => setSettings((p) => ({ ...p, minDeposit: e.target.value }))}
              placeholder="5"
            />
            <Input
              label="Đơn tối thiểu ($)"
              type="number"
              value={settings.minOrder}
              onChange={(e) => setSettings((p) => ({ ...p, minOrder: e.target.value }))}
              placeholder="1"
            />
            <Input
              label="Hoa hồng giới thiệu (%)"
              type="number"
              value={settings.referralBonus}
              onChange={(e) => setSettings((p) => ({ ...p, referralBonus: e.target.value }))}
              placeholder="5"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Maintenance */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold text-white">Chế độ bảo trì</h3>
        </Card.Header>
        <Card.Body>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-white">Bật chế độ bảo trì</p>
              <p className="text-xs text-text-muted mt-1">
                Khi bật, chỉ quản trị viên mới có thể truy cập trang web
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                className="sr-only"
              />
              <div
                className={`
                  w-12 h-6 rounded-full transition-colors cursor-pointer
                  ${settings.maintenanceMode ? 'bg-accent' : 'bg-border'}
                `}
                onClick={() => setSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5
                    ${settings.maintenanceMode ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}
                  `}
                />
              </div>
            </div>
          </label>
        </Card.Body>
      </Card>

      {/* Seed Data */}
      <Card className="border-warning/20">
        <Card.Header>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-white">Công cụ phát triển</h3>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Tạo dữ liệu mẫu</p>
              <p className="text-xs text-text-muted mt-1">
                Tạo người dùng, dịch vụ và đơn hàng mẫu để kiểm thử
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={seedData}
              loading={seeding}
              className="border-warning/30 text-warning hover:bg-warning/10"
            >
              <Database className="w-4 h-4" /> Tạo dữ liệu mẫu
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} loading={saving} size="lg">
          <Save className="w-4 h-4" /> Lưu tất cả cài đặt
        </Button>
      </div>
    </div>
  );
}
