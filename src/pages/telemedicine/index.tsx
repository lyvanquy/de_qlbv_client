import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { Plus, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function TelemedicinePage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    patientId: '', doctorId: '', scheduledAt: '', duration: '30', 
    reason: '', meetingLink: '', status: 'SCHEDULED' 
  });

  const { data, isLoading } = useQuery('teleconsults', () => 
    api.get('/telemedicine').then(r => r.data.data));

  const createMut = useMutation(
    (d: typeof form) => {
      // Validate
      if (!d.patientId || !d.doctorId || !d.scheduledAt) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      // Convert types
      const payload = {
        ...d,
        duration: parseInt(d.duration) || 30,
        scheduledAt: new Date(d.scheduledAt).toISOString(),
      };
      return api.post('/telemedicine', payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('teleconsults'); 
        setShowModal(false); 
        setForm({ patientId: '', doctorId: '', scheduledAt: '', duration: '30', reason: '', meetingLink: '', status: 'SCHEDULED' });
        toast.success('Tạo lịch khám từ xa thành công'); 
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
      if (!data.patientId || !data.doctorId || !data.scheduledAt) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      // Convert types
      const payload = {
        ...data,
        duration: parseInt(data.duration) || 30,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      };
      return api.put(`/telemedicine/${id}`, payload);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('teleconsults'); 
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

  const deleteMut = useMutation((id: string) => api.delete(`/telemedicine/${id}`), {
    onSuccess: () => { qc.invalidateQueries('teleconsults'); toast.success('Xóa lịch khám thành công'); },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lịch khám này?')) {
      deleteMut.mutate(id);
    }
  };

  const startSessionMut = useMutation((id: string) => api.post(`/telemedicine/${id}/start`), {
    onSuccess: () => { qc.invalidateQueries('teleconsults'); toast.success('Bắt đầu phiên khám'); },
  });

  const endSessionMut = useMutation(({ id, note }: { id: string; note: string }) => 
    api.post(`/telemedicine/${id}/end`, { note }), {
    onSuccess: () => { qc.invalidateQueries('teleconsults'); toast.success('Kết thúc phiên khám'); },
  });

  const consults = data?.consults || [];

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      patientId: c.patientId,
      doctorId: c.doctorId,
      scheduledAt: format(new Date(c.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
      duration: c.duration.toString(),
      reason: c.reason,
      meetingLink: c.meetingLink || '',
      status: c.status,
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
          <Video className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khám từ xa</h1>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ patientId: '', doctorId: '', scheduledAt: '', duration: '30', reason: '', meetingLink: '', status: 'SCHEDULED' }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo lịch khám
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Bệnh nhân', 'Bác sĩ', 'Thời gian', 'Thời lượng', 'Lý do', 'Trạng thái', 'Hành động'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : consults.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có lịch khám từ xa</td></tr>
            ) : (
              consults.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.patient?.name}</td>
                  <td className="px-4 py-3">{c.doctor?.user?.name}</td>
                  <td className="px-4 py-3">{format(new Date(c.scheduledAt), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-4 py-3">{c.duration} phút</td>
                  <td className="px-4 py-3">{c.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status === 'SCHEDULED' && (
                        <>
                          <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 text-xs">
                            Sửa
                          </button>
                          <button onClick={() => startSessionMut.mutate(c.id)} className="text-green-600 hover:text-green-800 text-xs">
                            Bắt đầu
                          </button>
                        </>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <button onClick={() => endSessionMut.mutate({ id: c.id, note: 'Completed' })} className="text-orange-600 hover:text-orange-800 text-xs">
                          Kết thúc
                        </button>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 text-xs">
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

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Sửa lịch khám' : 'Tạo lịch khám từ xa'}>
        <div className="space-y-4">
          <div>
            <label className="label">Mã bệnh nhân *</label>
            <input type="text" className="input" value={form.patientId} 
              onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="Nhập mã bệnh nhân" />
          </div>
          <div>
            <label className="label">Mã bác sĩ *</label>
            <input type="text" className="input" value={form.doctorId} 
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })} placeholder="Nhập mã bác sĩ" />
          </div>
          <div>
            <label className="label">Thời gian *</label>
            <input type="datetime-local" className="input" value={form.scheduledAt} 
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          </div>
          <div>
            <label className="label">Thời lượng (phút)</label>
            <input type="number" className="input" value={form.duration} 
              onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" />
          </div>
          <div>
            <label className="label">Lý do khám</label>
            <textarea className="input" value={form.reason} 
              onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Mô tả lý do khám" />
          </div>
          <div>
            <label className="label">Link cuộc họp</label>
            <input type="text" className="input" value={form.meetingLink} 
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
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
