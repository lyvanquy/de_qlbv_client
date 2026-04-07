import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Pill, AlertTriangle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';

// Types
interface MedicineForm {
  code: string;
  name: string;
  category: string;
  unit: string;
  price: string;
  stock: string;
  minStock: string;
}

interface StockForm {
  type: string;
  quantity: string;
  reason: string;
}

const INITIAL_MEDICINE_FORM: MedicineForm = {
  code: '',
  name: '',
  category: '',
  unit: '',
  price: '',
  stock: '',
  minStock: '',
};

const INITIAL_STOCK_FORM: StockForm = {
  type: 'IN',
  quantity: '',
  reason: '',
};

export default function PharmacyPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicineForm>(INITIAL_MEDICINE_FORM);
  const [stockForm, setStockForm] = useState<StockForm>(INITIAL_STOCK_FORM);

  // Queries
  const { data: medicinesData, isLoading } = useQuery(
    ['medicines', search],
    () => api.get('/pharmacy/medicines', { params: { search } }).then((r) => r.data.data)
  );

  const { data: lowStockData } = useQuery('low-stock', () =>
    api.get('/pharmacy/alerts/low-stock').then((r) => r.data.data)
  );

  // Mutations
  const createMut = useMutation((data: MedicineForm) => api.post('/pharmacy/medicines', data), {
    onSuccess: () => {
      qc.invalidateQueries('medicines');
      setShowModal(false);
      setForm(INITIAL_MEDICINE_FORM);
      toast.success('Thêm thuốc thành công');
    },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const updateMut = useMutation(
    ({ id, data }: { id: string; data: MedicineForm }) =>
      api.put(`/pharmacy/medicines/${id}`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('medicines');
        setShowModal(false);
        setEditingId(null);
        setForm(INITIAL_MEDICINE_FORM);
        toast.success('Cập nhật thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const deleteMut = useMutation((id: string) => api.delete(`/pharmacy/medicines/${id}`), {
    onSuccess: () => {
      qc.invalidateQueries('medicines');
      toast.success('Xóa thuốc thành công');
    },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const adjustStockMut = useMutation(
    ({ id, data }: { id: string; data: StockForm }) =>
      api.post(`/pharmacy/medicines/${id}/stock`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('medicines');
        qc.invalidateQueries('low-stock');
        setShowStockModal(null);
        setStockForm(INITIAL_STOCK_FORM);
        toast.success('Điều chỉnh tồn kho thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const medicines = medicinesData?.medicines || [];
  const lowStock = lowStockData || [];

  const handleEdit = (med: any) => {
    setEditingId(med.id);
    setForm({
      code: med.code,
      name: med.name,
      category: med.category || '',
      unit: med.unit,
      price: med.price.toString(),
      stock: med.stock.toString(),
      minStock: med.minStock.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMut.mutate({ id: editingId, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thuốc này?')) {
      deleteMut.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(INITIAL_MEDICINE_FORM);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(INITIAL_MEDICINE_FORM);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Pill className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà thuốc</h1>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Thêm thuốc
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-yellow-800">Cảnh báo tồn kho thấp</p>
            <p className="text-sm text-yellow-700">
              {lowStock.length} thuốc có tồn kho dưới mức tối thiểu
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm thuốc theo tên hoặc mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Mã', 'Tên thuốc', 'Danh mục', 'Đơn vị', 'Giá', 'Tồn kho', 'Tối thiểu', 'Hành động'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Chưa có thuốc
                </td>
              </tr>
            ) : (
              medicines.map((m: any) => (
                <tr
                  key={m.id}
                  className={`hover:bg-gray-50 ${m.stock <= m.minStock ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-4 py-3">{m.code}</td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">{m.category || 'N/A'}</td>
                  <td className="px-4 py-3">{m.unit}</td>
                  <td className="px-4 py-3">{m.price?.toLocaleString() || 0} đ</td>
                  <td className="px-4 py-3">
                    <span className={m.stock <= m.minStock ? 'text-red-600 font-medium' : ''}>
                      {m.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.minStock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(m)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setShowStockModal(m.id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Điều chỉnh
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? 'Sửa thuốc' : 'Thêm thuốc'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mã thuốc</label>
            <input
              type="text"
              className="input"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Tên thuốc</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Danh mục</label>
            <input
              type="text"
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Đơn vị</label>
              <input
                type="text"
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Giá</label>
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tồn kho</label>
              <input
                type="number"
                className="input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Tồn kho tối thiểu</label>
              <input
                type="number"
                className="input"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="btn-secondary">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMut.isLoading || updateMut.isLoading}
              className="btn-primary"
            >
              {createMut.isLoading || updateMut.isLoading
                ? 'Đang xử lý...'
                : editingId
                ? 'Cập nhật'
                : 'Thêm'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        open={!!showStockModal}
        onClose={() => {
          setShowStockModal(null);
          setStockForm(INITIAL_STOCK_FORM);
        }}
        title="Điều chỉnh tồn kho"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Loại</label>
            <select
              className="input"
              value={stockForm.type}
              onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
            >
              <option value="IN">Nhập kho</option>
              <option value="OUT">Xuất kho</option>
              <option value="ADJUST">Điều chỉnh</option>
            </select>
          </div>
          <div>
            <label className="label">Số lượng</label>
            <input
              type="number"
              className="input"
              value={stockForm.quantity}
              onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Lý do</label>
            <textarea
              className="input"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowStockModal(null);
                setStockForm(INITIAL_STOCK_FORM);
              }}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={() =>
                showStockModal && adjustStockMut.mutate({ id: showStockModal, data: stockForm })
              }
              disabled={adjustStockMut.isLoading}
              className="btn-primary"
            >
              {adjustStockMut.isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
