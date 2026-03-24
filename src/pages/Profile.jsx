import { useEffect, useMemo, useState } from 'react';
import { User, Lock, CreditCard, ImagePlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { formatDateTime, formatVndRaw } from '../utils/format';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ username: '', email: '', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [payments, setPayments] = useState([]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Chỉ hỗ trợ JPG, PNG, WEBP');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Ảnh tối đa 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await api.post('/user/avatar/upload', { image: dataUrl });
      const uploadedUrl = response.data.data?.avatarUrl;

      if (!uploadedUrl) {
        setAvatarError('Upload avatar thất bại');
        return;
      }

      setProfileForm((p) => ({ ...p, avatarUrl: uploadedUrl }));
      setAvatarPreview(uploadedUrl);
      toast.success('Upload avatar thành công, bấm Lưu hồ sơ để cập nhật');
    } catch {
      setAvatarError('Không thể upload ảnh, vui lòng thử lại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const clearAvatar = () => {
    setProfileForm((p) => ({ ...p, avatarUrl: '' }));
    setAvatarPreview('');
    setAvatarError('');
  };

  const avatarDisplay = avatarPreview || profileForm.avatarUrl;

  useEffect(() => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    });
  }, [user?.username, user?.email, user?.avatarUrl]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const avatarFallback = useMemo(() => (user?.username?.charAt(0)?.toUpperCase() || 'U'), [user?.username]);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await api.get('/user/payments');
      setPayments(response.data.data?.transactions || []);
    } catch (err) {
      console.error('Failed to fetch payments', err);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.username || !profileForm.email) {
      toast.error('Vui lòng nhập username và email');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await api.put('/user/me', profileForm);
      const updatedUser = response.data.data?.user;
      if (updatedUser) updateUser(updatedUser);
      setAvatarPreview('');
      toast.success('Đã cập nhật hồ sơ');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đổi mật khẩu thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Hồ sơ cá nhân</h1>
        <p className="text-sm text-[#a0a0b0]">Quản lý avatar, thông tin tài khoản, mật khẩu và lịch sử thanh toán</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="font-semibold text-white">Thông tin hồ sơ</h3>
            </div>

            <div className="p-4 rounded-xl bg-[#0f0f1a] border border-[#2d2d44] space-y-3">
              <div className="flex items-center gap-4">
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-[#2d2d44]" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00d4aa] flex items-center justify-center text-white text-xl font-bold">
                    {avatarFallback}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-[#a0a0b0]">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2d2d44] text-sm text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/40 cursor-pointer transition-all">
                  <ImagePlus className="w-4 h-4" />
                  <span>{uploadingAvatar ? 'Đang đọc ảnh...' : 'Upload avatar'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarFile}
                    disabled={uploadingAvatar}
                  />
                </label>

                {avatarDisplay && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#ff4757]/30 text-[#ff4757] hover:bg-[#ff4757]/10 text-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                    Xóa ảnh
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#6b6b80]">Hỗ trợ JPG/PNG/WEBP, tối đa 2MB</p>
              {avatarError ? <p className="text-xs text-[#ff4757]">{avatarError}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <Button type="submit" loading={savingProfile}>Lưu hồ sơ</Button>
          </form>

          <form onSubmit={handleChangePassword} className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#ffa502]" />
              <h3 className="font-semibold text-white">Đổi mật khẩu</h3>
            </div>

            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            />

            <Button type="submit" loading={savingPassword} variant="teal">Đổi mật khẩu</Button>
          </form>
        </div>

        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="font-semibold text-white">Lịch sử thanh toán</h3>
          </div>

          {loadingPayments ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-[#a0a0b0]">Chưa có giao dịch nạp tiền nào</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {payments.map((tx) => (
                <div key={tx._id} className="p-3 rounded-lg bg-[#0f0f1a] border border-[#2d2d44]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#00d4aa]">+{formatVndRaw(Math.abs(tx.amount || 0))}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : tx.status === 'pending' ? 'bg-[#ffa502]/10 text-[#ffa502]' : 'bg-[#ff4757]/10 text-[#ff4757]'}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#a0a0b0]">{tx.note || tx.transactionId || 'N/A'}</p>
                  <p className="text-[11px] text-[#6b6b80] mt-1">{formatDateTime(tx.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
