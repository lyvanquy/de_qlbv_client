import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { Plus, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsentPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    patientId: '', type: 'SURGERY', title: '', content: '', 
    risks: '', benefits: '' 
  });
  const [signForm, setSignForm] = useState({ signedBy: '', witnessId: '', fileUrl: '' });

  const { data, isLoading } = useQuery('consent-forms', () => 
    api.get('/consent').then(r => r.data.data));

  const createMut = useMutation(
    (d: typeof form) => {
      // Validate
      if (!d.patientId || !d.title || !d.content) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      return api.post('/consent', d);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('consent-forms'); 
        setShowModal(false); 
        setForm({ patientId: '', type: 'SURGERY', title: '', content: '', risks: '', benefits: '' });
        toast.success('Tạo phiếu đồng ý thành công'); 
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
      if (!data.patientId || !data.title || !data.content) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      }
      return api.put(`/consent/${id}`, data);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('consent-forms'); 
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

  const signMut = useMutation(({ id, data }: { id: string; data: typeof signForm }) => 
    api.put(`/consent/${id}/sign`, data), {
    onSuccess: () => { qc.invalidateQueries('consent-forms'); setShowSignModal(null); toast.success('Ký thành công'); },
  });

  const deleteMut = useMutation((id: string) => api.delete(`/consent/${id}`), {
    onSuccess: () => { qc.invalidateQueries('consent-forms'); toast.success('Xóa phiếu thành công'); },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phiếu đồng ý này?')) {
      deleteMut.mutate(id);
    }
  };

  const forms = data?.forms || [];

  const handleEdit = (f: any) => {
    setEditingId(f.id);
    setForm({
      patientId: f.patientId,
      type: f.type,
      title: f.title,
      content: f.content,
      risks: f.risks || '',
      benefits: f.benefits || '',
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
          <FileCheck className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đồng ý điều trị</h1>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ patientId: '', type: 'SURGERY', title: '', content: '', risks: '', benefits: '' }); setShowModal(true); }} 
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo phiếu đồng ý
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Bệnh nhân', 'Loại', 'Tiêu đề', 'Ngày tạo', 'Đã ký', 'Người ký', 'Hành động'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : forms.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có phiếu đồng ý</td></tr>
            ) : (
              forms.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{f.patient?.name}</td>
                  <td className="px-4 py-3">{f.type}</td>
                  <td className="px-4 py-3">{f.title}</td>
                  <td className="px-4 py-3">{format(new Date(f.createdAt), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3">
                    {f.signedAt ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Đã ký</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Chưa ký</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{f.signedBy || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!f.signedAt && (
                        <>
                          <button onClick={() => handleEdit(f)} className="text-blue-600 hover:text-blue-800 text-xs">
                            Sửa
                          </button>
                          <button onClick={() => setShowSignModal(f.id)} className="text-green-600 hover:text-green-800 text-xs">
                            Ký
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800 text-xs">
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
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? 'Sửa phiếu đồng ý' : 'Tạo phiếu đồng ý'}>
        <div className="space-y-4">
          <div>
            <label className="label">Mã bệnh nhân *</label>
            <input type="text" className="input" value={form.patientId} 
              onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="Nhập mã bệnh nhân" />
          </div>
          <div>
            <label className="label">Loại</label>
            <select className="input" value={form.type} 
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="SURGERY">Phẫu thuật</option>
              <option value="PROCEDURE">Thủ thuật</option>
              <option value="TREATMENT">Điều trị</option>
              <option value="RESEARCH">Nghiên cứu</option>
            </select>
          </div>
          <div>
            <label className="label">Tiêu đề *</label>
            <input type="text" className="input" value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nhập tiêu đề phiếu đồng ý" />
          </div>
          <div>
            <label className="label">Nội dung *</label>
            <textarea className="input" rows={4} value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Nhập nội dung chi tiết" />
          </div>
          <div>
            <label className="label">Rủi ro</label>
            <textarea className="input" rows={2} value={form.risks} 
              onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Mô tả các rủi ro có thể xảy ra" />
          </div>
          <div>
            <label className="label">Lợi ích</label>
            <textarea className="input" rows={2} value={form.benefits} 
              onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="Mô tả lợi ích của điều trị" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">{editingId ? 'Cập nhật' : 'Tạo'}</button>
          </div>
        </div>
      </Modal>

      {/* Sign Modal */}
      <Modal open={!!showSignModal} onClose={() => setShowSignModal(null)} title="Ký phiếu đồng ý">
        <div className="space-y-4">
          <div>
            <label className="label">Người ký</label>
            <input type="text" className="input" value={signForm.signedBy} 
              onChange={(e) => setSignForm({ ...signForm, signedBy: e.target.value })} />
          </div>
          <div>
            <label className="label">Mã người chứng kiến</label>
            <input type="text" className="input" value={signForm.witnessId} 
              onChange={(e) => setSignForm({ ...signForm, witnessId: e.target.value })} />
          </div>
          <div>
            <label className="label">URL file đã ký</label>
            <input type="text" className="input" value={signForm.fileUrl} 
              onChange={(e) => setSignForm({ ...signForm, fileUrl: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowSignModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => showSignModal && signMut.mutate({ id: showSignModal, data: signForm })} className="btn-primary">
              Ký
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
