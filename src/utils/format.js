const VND_RATE = 26800;

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0đ';

  const value = parseFloat(amount);
  if (Number.isNaN(value)) return '0đ';

  // Giá dịch vụ có thể đã ở VND trong DB (ví dụ 25270),
  // chỉ quy đổi khi giá đang ở USD (thường là số nhỏ như 0.95, 1.2...)
  const vnd = value >= 1000 ? value : value * VND_RATE;

  return new Intl.NumberFormat('vi-VN').format(Math.round(vnd)) + 'đ';
}

export function usdToVnd(amount) {
  if (amount === null || amount === undefined) return 0;
  const value = parseFloat(amount);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * VND_RATE);
}

export function formatVndRaw(amount) {
  if (amount === null || amount === undefined) return '0đ';
  const value = parseFloat(amount);
  if (Number.isNaN(value)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(value)) + 'đ';
}

export function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  num = parseFloat(num);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function getStatusColor(status) {
  const statusMap = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    processing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    completed: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    refunded: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    active: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    deposit: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    withdrawal: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    order: { bg: 'bg-accent/10', text: 'text-accent-light', border: 'border-accent/20' },
    open: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    answered: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    closed: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  };
  return statusMap[status?.toLowerCase()] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatApiDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
