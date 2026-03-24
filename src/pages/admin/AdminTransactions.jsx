import { useState, useEffect } from "react";
import {
  Receipt, Search, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, XCircle, Eye, DollarSign, ArrowDownLeft, User
} from "lucide-react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import { formatDateTime, formatVndRaw } from "../../utils/format";
import { useToast } from "../../components/Toast";
import api from "../../services/api";

function formatVND(amount) {
  return formatVndRaw(amount);
}

const TYPE_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "deposit", label: "Nạp tiền" },
  { value: "withdrawal", label: "Rút tiền" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Đang chờ" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [depositTotal, setDepositTotal] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const perPage = 15;
  const toast = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter, search]);

  const fetchTransactions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (typeFilter !== "all") params.type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const response = await api.get("/admin/transactions", { params });
      const data = response.data.data;
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setDepositTotal(data.depositTotal || 0);
    } catch (err) {
      console.error("Lỗi khi lấy giao dịch:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openDetail = (tx) => {
    setSelectedTx(tx);
    setDetailModal(true);
  };

  const confirmTransaction = async (txId) => {
    setConfirming(true);
    try {
      await api.post("/admin/transactions/confirm", { transactionId: txId });
      setTransactions((prev) =>
        prev.map((t) => (t._id === txId ? { ...t, status: "completed" } : t))
      );
      if (selectedTx && selectedTx._id === txId) {
        setSelectedTx((prev) => ({ ...prev, status: "completed" }));
      }
      toast.success("Xác nhận giao dịch thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xác nhận giao dịch thất bại");
    } finally {
      setConfirming(false);
    }
  };

  const cancelTransaction = async (txId) => {
    setConfirming(true);
    try {
      await api.post("/admin/transactions/cancel", { transactionId: txId });
      setTransactions((prev) =>
        prev.map((t) => (t._id === txId ? { ...t, status: "cancelled" } : t))
      );
      if (selectedTx && selectedTx._id === txId) {
        setSelectedTx((prev) => ({ ...prev, status: "cancelled" }));
      }
      toast.success("Hủy giao dịch thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Hủy giao dịch thất bại");
    } finally {
      setConfirming(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: "Đang chờ", color: "warning" },
      completed: { label: "Hoàn thành", color: "success" },
      cancelled: { label: "Đã hủy", color: "danger" },
    };
    const info = map[status] || { label: status, color: "default" };
    return <Badge color={info.color}>{info.label}</Badge>;
  };

  const getTypeIcon = (type) => {
    if (type === "deposit") return <ArrowDownLeft className="w-4 h-4 text-teal" />;
    if (type === "withdrawal") return <DollarSign className="w-4 h-4 text-warning" />;
    return <Receipt className="w-4 h-4 text-accent" />;
  };

  const getTypeLabel = (type) => {
    if (type === "deposit") return "Nạp tiền";
    if (type === "withdrawal") return "Rút tiền";
    return type || "Khác";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quản lý giao dịch</h2>
            <p className="text-sm text-text-secondary">{totalCount} giao dịch</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-teal/10 border border-teal/20">
            <p className="text-xs text-text-muted">Tổng nạp tiền</p>
            <p className="text-sm font-bold text-teal">{formatVND(depositTotal)}</p>
          </div>
          <Button variant="secondary" onClick={() => fetchTransactions(true)} loading={refreshing}>
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-1 flex-wrap">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setTypeFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === f.value
                      ? "bg-accent text-white"
                      : "bg-white/5 text-text-secondary hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f.value
                      ? "bg-accent text-white"
                      : "bg-white/5 text-text-secondary hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm theo mã GD, user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1a1a2e] border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-16"><Spinner size="lg" /></div>
          ) : transactions.length > 0 ? (
            <>
              <Table>
                <Table.Head>
                  <Table.Th>Mã giao dịch</Table.Th>
                  <Table.Th>Người dùng</Table.Th>
                  <Table.Th>Loại</Table.Th>
                  <Table.Th>Số tiền</Table.Th>
                  <Table.Th>Phương thức</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>Ngày</Table.Th>
                  <Table.Th>Hành động</Table.Th>
                </Table.Head>
                <Table.Body>
                  {transactions.map((tx) => (
                    <Table.Row key={tx._id}>
                      <Table.Cell className="font-mono text-xs text-accent">
                        {tx.transactionId ? tx.transactionId.slice(0, 16) + "..." : "N/A"}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-white">
                            {tx.user?.username || tx.user?.email || "N/A"}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(tx.type)}
                          <span className="text-xs text-text-secondary">
                            {getTypeLabel(tx.type)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className={`font-semibold text-sm ${
                        tx.type === "deposit" ? "text-teal" : "text-white"
                      }`}>
                        {(tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : "") + formatVND(Math.abs(tx.amount))}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-text-muted capitalize">
                          {tx.paymentMethod || "N/A"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{getStatusBadge(tx.status)}</Table.Cell>
                      <Table.Cell className="text-xs text-text-muted">
                        {formatDateTime(tx.createdAt)}
                      </Table.Cell>
                      <Table.Cell>
                        <Button variant="ghost" size="icon" onClick={() => openDetail(tx)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-text-muted">
                    Trang {page} / {totalPages} — {totalCount} giao dịch
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let num = i + 1;
                      if (totalPages > 5 && page > 3) num = page - 2 + i;
                      if (totalPages > 5 && page > totalPages - 2) num = totalPages - 4 + i;
                      return (
                        <Button
                          key={num}
                          variant={page === num ? "primary" : "ghost"}
                          size="icon"
                          onClick={() => setPage(num)}
                        >
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
              <Receipt className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary">Không tìm thấy giao dịch nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Chi tiết giao dịch"
        size="md"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Mã giao dịch</p>
                <p className="text-sm font-mono text-accent break-all">
                  {selectedTx.transactionId || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Trạng thái</p>
                <div className="mt-0.5">{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Người dùng</p>
                <p className="text-sm text-white">{selectedTx.user?.username || "N/A"}</p>
                <p className="text-xs text-text-muted">{selectedTx.user?.email || ""}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Loại</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getTypeIcon(selectedTx.type)}
                  <span className="text-sm text-white">{getTypeLabel(selectedTx.type)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Số tiền</p>
                <p className={`text-lg font-bold ${
                  selectedTx.type === "deposit" ? "text-teal" : "text-white"
                }`}>
                  {(selectedTx.type === "deposit" ? "+" : selectedTx.type === "withdrawal" ? "-" : "") + formatVND(Math.abs(selectedTx.amount))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Phương thức</p>
                <p className="text-sm text-white capitalize">{selectedTx.paymentMethod || "N/A"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-text-muted">Mô tả</p>
                <p className="text-sm text-white">{selectedTx.note || "Không có"}</p>
              </div>
              {selectedTx.referenceCode && (
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-text-muted">Mã tham chiếu</p>
                  <p className="text-sm font-mono text-white break-all">{selectedTx.referenceCode}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Ngày tạo</p>
                <p className="text-sm text-white">{formatDateTime(selectedTx.createdAt)}</p>
              </div>
              {selectedTx.updatedAt && selectedTx.updatedAt !== selectedTx.createdAt && (
                <div className="space-y-1">
                  <p className="text-xs text-text-muted">Cập nhật lần cuối</p>
                  <p className="text-sm text-white">{formatDateTime(selectedTx.updatedAt)}</p>
                </div>
              )}
            </div>

            {selectedTx.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => confirmTransaction(selectedTx._id)}
                  loading={confirming}
                  className="flex-1 bg-teal hover:bg-teal/90"
                >
                  <CheckCircle className="w-4 h-4" /> Xác nhận
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => cancelTransaction(selectedTx._id)}
                  loading={confirming}
                  className="flex-1 border-danger/30 text-danger hover:bg-danger/10"
                >
                  <XCircle className="w-4 h-4" /> Hủy
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
