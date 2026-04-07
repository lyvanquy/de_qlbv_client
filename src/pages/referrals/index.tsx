import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { Plus, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export default function ReferralsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    patientId: '', toFacility: '', toDoctor: '', reason: '', 
    diagnosis: '', urgency: 'ROUTINE', status: 'PENDING' 
  });

  const { data, isLoading } = useQuery('referrals', () => 
    api.get('/referrals').then(r => r.data.data));

  const createMut = useMutation(
    (d: typeof form) => {
      // Validate
      if (!d.patientId || !d.toFacility || !d.reason) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      return api.post('/referrals', d);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('referrals'); 
        setShowModal(false); 
        setForm({ patientId: '', toFacility: '', toDoctor: '', reason: '', diagnosis: '', urgency: 'ROUTINE', status: 'PENDING' });
        toast.success('Tạo chuyển viện thành công'); 
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
      if (!data.patientId || !data.toFacility || !data.reason) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      return api.put(`/referrals/${id}`, data);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('referrals'); 
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

  const deleteMut = useMutation((id: string) => api.delete(`/referrals/${id}`), {
    onSuccess: () => { qc.invalidateQueries('referrals'); toast.success('Xóa chuyển viện thành công'); },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa chuyển viện này?')) {
      deleteMut.mutate(id);
    }
  };

  const referrals = data?.referrals || [];

  const handleEdit = (ref: any) => {
    setEditingId(ref.id);
    setForm({
      patientId: ref.patientId,
      toFacility: ref.toFacility,
      toDoctor: ref.toDoctor || '',
      reason: ref.reason,
      diagnosis: ref.diagnosis || '',
      urgency: ref.urgency,
      status: ref.status,
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
          <ArrowRightLeft className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý chuyển viện</h1>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ patientId: '', toFacility: '', toDoctor: '', reason: '', diagnosis: '', urgency: 'ROUTINE', status: 'PENDING' }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo chuyển viện
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Bệnh nhân', 'Chuyển đến', 'Bác sĩ', 'Lý do', 'Mức độ', 'Trạng thái', 'Ngày tạo', 'Hành động'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : referrals.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Chưa có chuyển viện</td></tr>
            ) : (
              referrals.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.patient?.name}</td>
                  <td className="px-4 py-3">{r.toFacility}</td>
                  <td className="px-4 py-3">{r.toDoctor || '-'}</td>
                  <td className="px-4 py-3">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${r.urgency === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">{format(new Date(r.createdAt), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800 text-xs">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 text-xs">
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

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Sửa chuyển viện' : 'Tạo chuyển viện'}>
        <div className="space-y-4">
          <div>
            <label className="label">Mã bệnh nhân *</label>
            <input type="text" className="input" value={form.patientId} 
              onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="Nhập mã bệnh nhân" />
          </div>
          <div>
            <label className="label">Chuyển đến cơ sở *</label>
            <input type="text" className="input" value={form.toFacility} 
              onChange={(e) => setForm({ ...form, toFacility: e.target.value })} placeholder="Tên bệnh viện/phòng khám" />
          </div>
          <div>
            <label className="label">Bác sĩ tiếp nhận</label>
            <input type="text" className="input" value={form.toDoctor} 
              onChange={(e) => setForm({ ...form, toDoctor: e.target.value })} placeholder="Tên bác sĩ (tùy chọn)" />
          </div>
          <div>
            <label className="label">Lý do chuyển viện *</label>
            <textarea className="input" value={form.reason} 
              onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Mô tả lý do chuyển viện" />
          </div>
          <div>
            <label className="label">Chẩn đoán</label>
            <textarea className="input" value={form.diagnosis} 
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Chẩn đoán ban đầu" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mức độ</label>
              <select className="input" value={form.urgency} 
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="ROUTINE">Thường quy</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>
            <div>
              <label className="label">Trạng thái</label>
              <select className="input" value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="PENDING">Chờ xử lý</option>
                <option value="ACCEPTED">Đã chấp nhận</option>
                <option value="REJECTED">Từ chối</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">{editingId ? 'Cập nhật' : 'Tạo'}</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
