import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Stethoscope, Search } from 'lucide-react';

export default function DoctorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    userId: '', specialty: '', experienceYears: '', roomNumber: '', bio: '' 
  });

  const { data, isLoading } = useQuery(['doctors', search], () => 
    api.get('/doctors', { params: { search } }).then(r => r.data.data));

  const createMut = useMutation(
    (d: typeof form) => {
      // Validate
      if (!d.userId || !d.specialty) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      // Convert types
      const payload = {
        ...d,
        experienceYears: parseInt(d.experienceYears) || 0,
      };
      return api.post('/doctors', payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('doctors'); 
        setShowModal(false); 
        setForm({ userId: '', specialty: '', experienceYears: '', roomNumber: '', bio: '' });
        toast.success('Thêm bác sĩ thành công'); 
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
      if (!data.userId || !data.specialty) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      // Convert types
      const payload = {
        ...data,
        experienceYears: parseInt(data.experienceYears) || 0,
      };
      return api.put(`/doctors/${id}`, payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('doctors'); 
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

  const deleteMut = useMutation((id: string) => api.delete(`/doctors/${id}`), {
    onSuccess: () => { qc.invalidateQueries('doctors'); toast.success('Xóa bác sĩ thành công'); },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bác sĩ này?')) {
      deleteMut.mutate(id);
    }
  };

  const doctors = data || [];

  const handleEdit = (doc: any) => {
    setEditingId(doc.id);
    setForm({
      userId: doc.userId,
      specialty: doc.specialty,
      experienceYears: doc.experienceYears?.toString() || '',
      roomNumber: doc.roomNumber || '',
      bio: doc.bio || '',
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
          <Stethoscope className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h1>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ userId: '', specialty: '', experienceYears: '', roomNumber: '', bio: '' }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Thêm bác sĩ
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm bác sĩ..."
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
              {['Tên', 'Email', 'Chuyên khoa', 'Kinh nghiệm', 'Phòng', 'Hành động'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : doctors.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Chưa có bác sĩ</td></tr>
            ) : (
              doctors.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{d.user?.name}</td>
                  <td className="px-4 py-3">{d.user?.email}</td>
                  <td className="px-4 py-3">{d.specialty}</td>
                  <td className="px-4 py-3">{d.experienceYears} năm</td>
                  <td className="px-4 py-3">{d.roomNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800 text-xs">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800 text-xs">
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

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Sửa bác sĩ' : 'Thêm bác sĩ'}>
        <div className="space-y-4">
          <div>
            <label className="label">Mã người dùng *</label>
            <input type="text" className="input" value={form.userId} 
              onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="Nhập mã người dùng" />
          </div>
          <div>
            <label className="label">Chuyên khoa *</label>
            <input type="text" className="input" value={form.specialty} 
              onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Ví dụ: Nội khoa, Ngoại khoa" />
          </div>
          <div>
            <label className="label">Kinh nghiệm (năm)</label>
            <input type="number" className="input" value={form.experienceYears} 
              onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Phòng khám</label>
            <input type="text" className="input" value={form.roomNumber} 
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="Ví dụ: P101" />
          </div>
          <div>
            <label className="label">Giới thiệu</label>
            <textarea className="input" rows={3} value={form.bio} 
              onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Giới thiệu về bác sĩ" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">{editingId ? 'Cập nhật' : 'Thêm'}</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
