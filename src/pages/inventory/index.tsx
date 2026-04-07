import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Package, Search } from 'lucide-react';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ code: '', name: '', category: '', unit: '', quantity: '', minQuantity: '' });
  const [adjustForm, setAdjustForm] = useState({ type: 'IN', quantity: '', reason: '' });

  const { data, isLoading } = useQuery(['inventory', search, category], () => 
    api.get('/inventory', { params: { search, category } }).then(r => r.data.data));

  const createMut = useMutation(
    (d: typeof form) => {
      // Validate
      if (!d.code || !d.name) {
        throw new Error('Vui lòng nhập đầy đủ mã và tên vật tư');
      }
      // Convert types
      const payload = {
        ...d,
        quantity: parseInt(d.quantity) || 0,
        minQuantity: parseInt(d.minQuantity) || 0,
      };
      return api.post('/inventory', payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('inventory'); 
        setShowModal(false); 
        setForm({ code: '', name: '', category: '', unit: '', quantity: '', minQuantity: '' });
        toast.success('Thêm vật tư thành công'); 
      },
      onError: (error: any) => {
        console.error('Error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const updateMut = useMutation(
    ({ id, data }: { id: string; data: typeof form }) => {
      // Validate
      if (!data.code || !data.name) {
        throw new Error('Vui lòng nhập đầy đủ mã và tên vật tư');
      }
      // Convert types
      const payload = {
        ...data,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 0,
      };
      return api.put(`/inventory/${id}`, payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('inventory'); 
        setShowModal(false); 
        setEditingId(null); 
        toast.success('Cập nhật thành công'); 
      },
      onError: (error: any) => {
        console.error('Error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const deleteMut = useMutation((id: string) => api.delete(`/inventory/${id}`), {
    onSuccess: () => { qc.invalidateQueries('inventory'); toast.success('Xóa vật tư thành công'); },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vật tư này?')) {
      deleteMut.mutate(id);
    }
  };

  const adjustMut = useMutation(({ id, data }: { id: string; data: typeof adjustForm }) => 
    api.post(`/inventory/${id}/adjust`, data), {
    onSuccess: () => { qc.invalidateQueries('inventory'); setShowAdjustModal(null); toast.success('Điều chỉnh thành công'); },
  });

  const items = data || [];

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      code: item.code,
      name: item.name,
      category: item.category || '',
      unit: item.unit,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
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

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kho vật tư</h1>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ code: '', name: '', category: '', unit: '', quantity: '', minQuantity: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Thêm vật tư
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm vật tư..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          <option value="Y te">Y tế</option>
          <option value="Van phong">Văn phòng</option>
          <option value="Thiet bi">Thiết bị</option>
          <option value="Khac">Khác</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Mã', 'Tên vật tư', 'Danh mục', 'Đơn vị', 'Số lượng', 'Tối thiểu', 'Hành động'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có vật tư</td></tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${item.quantity <= item.minQuantity ? 'bg-yellow-50' : ''}`}>
                  <td className="px-4 py-3">{item.code}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={item.quantity <= item.minQuantity ? 'text-red-600 font-medium' : ''}>{item.quantity}</span>
                  </td>
                  <td className="px-4 py-3">{item.minQuantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs">
                        Sửa
                      </button>
                      <button onClick={() => setShowAdjustModal(item.id)} className="text-green-600 hover:text-green-800 text-xs">
                        Điều chỉnh
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-xs">
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
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Sửa vật tư' : 'Thêm vật tư'}>
        <div className="space-y-4">
          <div>
            <label className="label">Mã vật tư *</label>
            <input type="text" className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ví dụ: VT001" />
          </div>
          <div>
            <label className="label">Tên vật tư *</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên vật tư" />
          </div>
          <div>
            <label className="label">Danh mục</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Chọn danh mục</option>
              <option value="Y te">Y tế</option>
              <option value="Van phong">Văn phòng</option>
              <option value="Thiet bi">Thiết bị</option>
              <option value="Khac">Khác</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Đơn vị</label>
              <input type="text" className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ví dụ: Cái, Hộp" />
            </div>
            <div>
              <label className="label">Số lượng</label>
              <input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Số lượng tối thiểu</label>
            <input type="number" className="input" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} placeholder="0" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">{editingId ? 'Cập nhật' : 'Thêm'}</button>
          </div>
        </div>
      </Modal>

      {/* Adjust Modal */}
      <Modal open={!!showAdjustModal} onClose={() => setShowAdjustModal(null)} title="Điều chỉnh số lượng">
        <div className="space-y-4">
          <div>
            <label className="label">Loại</label>
            <select className="input" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}>
              <option value="IN">Nhập kho</option>
              <option value="OUT">Xuất kho</option>
              <option value="ADJUST">Điều chỉnh</option>
            </select>
          </div>
          <div>
            <label className="label">Số lượng</label>
            <input type="number" className="input" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} />
          </div>
          <div>
            <label className="label">Lý do</label>
            <textarea className="input" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdjustModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => showAdjustModal && adjustMut.mutate({ id: showAdjustModal, data: adjustForm })} className="btn-primary">
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
