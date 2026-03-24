import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3x3, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

const CATEGORIES = ['All', 'Telegram', 'YouTube', 'TikTok', 'Instagram', 'Facebook', 'Twitter', 'Spotify'];

const CATEGORY_COLORS = {
  All: 'bg-[#6C63FF]/10 text-[#a09af9] border-[#6C63FF]/20',
  Telegram: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  YouTube: 'bg-red-500/10 text-red-400 border-red-500/20',
  TikTok: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Instagram: 'bg-gradient-to-r from-yellow-500/10 via-pink-500/10 to-purple-500/10 text-pink-400 border-pink-500/20',
  Facebook: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
  Twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Spotify: 'bg-green-500/10 text-green-400 border-green-500/20',
};

function formatK(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num;
}

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data?.services || response.data.services || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter((s) => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dịch vụ</h1>
        <p className="text-sm text-[#a0a0b0]">Danh sách tất cả dịch vụ SMM có sẵn</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-[#2d2d44] text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeCategory === cat
                ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25'
                : 'bg-[#1a1a2e] border border-[#2d2d44] text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/30'
              }
            `}
          >
            {cat === 'All' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div
              key={service._id}
              className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 hover:border-[#6C63FF]/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {service.name}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${CATEGORY_COLORS[service.category] || CATEGORY_COLORS.All}`}>
                    {service.category}
                  </span>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-lg font-bold text-[#00d4aa]">
                    {formatCurrency(service.pricePer1k)}
                  </p>
                  <p className="text-xs text-[#6b6b80]">/ 1k</p>
                </div>
              </div>

              <p className="text-[#a0a0b0] text-xs mb-4 line-clamp-2">
                {service.description || 'Dịch vụ chất lượng cao với thời gian nhanh.'}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-[#6b6b80]">Tối thiểu</p>
                  <p className="text-sm font-semibold text-white">{service.minOrder || 10}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-[#6b6b80]">Tối đa</p>
                  <p className="text-sm font-semibold text-white">{formatK(service.maxOrder || 10000)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-[#6b6b80]">Thời gian</p>
                  <p className="text-sm font-semibold text-white">{service.averageTime || '~24h'}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/order/new', { state: { serviceId: service._id } })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#7a73ff] text-white text-sm font-medium transition-all shadow-lg shadow-[#6C63FF]/20 hover:shadow-[#6C63FF]/30"
              >
                <ShoppingCart className="w-4 h-4" /> Đặt hàng ngay
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Grid3x3 className="w-12 h-12 mx-auto text-[#6b6b80] mb-3" />
          <p className="text-[#a0a0b0]">Không tìm thấy dịch vụ nào</p>
        </div>
      )}
    </div>
  );
}
