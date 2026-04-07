import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { Plus, ShoppingCart, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function ProcurementPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({ supplierId: '', note: '', items: [{ itemName: '', quantity: 1, unitPrice: 0, total: 0 }] });
  const [supplierForm, setSupplierForm] = useState({ code: '', name: '', contactName: '', phone: '', email: '', address: '' });

  const { data: ordersData, isLoading: ordersLoading } = useQuery('purchase-orders', () => api.get('/procurement/orders').then(r => r.data.data));
  const { data: suppliersData, isLoading: suppliersLoading } = useQuery('suppliers', () => api.get('/procurement/suppliers').then(r => r.data.data));

  const createOrderMut = useMutation(
    (d: typeof orderForm) => {
      if (!d.supplierId) {
        throw new Error('Vui lòng chọn nhà cung cấp');
      }
      if (!d.items || d.items.length === 0 || !d.items[0].itemName) {
        throw new Error('Vui lòng thêm ít nhất một hàng hóa');
      }
      return api.post('/procurement/orders', d);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('purchase-orders'); 
        setShowOrderModal(false); 
        setOrderForm({ supplierId: '', note: '', items: [{ itemName: '', quantity: 1, unitPrice: 0, total: 0 }] });
        toast.success('Tạo đơn mua hàng thành công');
      },
      onError: (error: any) => {
        console.error('Error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const createSupplierMut = useMutation(
    (d: typeof supplierForm) => {
      if (!d.code || !d.name) {
        throw new Error('Vui lòng nhập mã và tên nhà cung cấp');
      }
      return api.post('/procurement/suppliers', d);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('suppliers'); 
        setShowSupplierModal(false); 
        setSupplierForm({ code: '', name: '', contactName: '', phone: '', email: '', address: '' });
        toast.success('Thêm nhà cung cấp thành công');
      },
      onError: (error: any) => {
        console.error('Error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const updateSupplierMut = useMutation(
    ({ id, data }: { id: string; data: typeof supplierForm }) => {
      if (!data.code || !data.name) {
        throw new Error('Vui lòng nhập mã và tên nhà cung cấp');
      }
      return api.put(`/procurement/suppliers/${id}`, data);
    },
    {
      onSuccess: () => { 
        qc.invalidateQueries('suppliers'); 
        setShowSupplierModal(false); 
        setEditingSupId(null); 
        toast.success('Cập nhật thành công');
      },
      onError: (error: any) => {
        console.error('Error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const deleteSupplierMut = useMutation((id: string) => api.delete(`/procurement/suppliers/${id}`), {
    onSuccess: () => qc.invalidateQueries('suppliers'),
  });

  const updateOrderStatus = useMutation(({ id, status }: { id: string; status: string }) =>
    api.put(`/procurement/orders/${id}`, { status, ...(status === 'RECEIVED' ? { receivedAt: new Date() } : {}) }), {
    onSuccess: () => qc.invalidateQueries('purchase-orders'),
  });

  const orders = ordersData?.orders || [];
  const suppliers = suppliersData?.suppliers || [];

  const handleEditSupplier = (s: any) => {
    setEditingSupId(s.id);
    setSupplierForm({ code: s.code, name: s.name, contactName: s.contactName || '', phone: s.phone || '', email: s.email || '', address: s.address || '' });
    setShowSupplierModal(true);
  };

  const handleSubmitSupplier = () => {
    if (editingSupId) {
      updateSupplierMut.mutate({ id: editingSupId, data: supplierForm });
    } else {
      createSupplierMut.mutate(supplierForm);
    }
  };

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { itemName: '', quantity: 1, unitPrice: 0, total: 0 }] }));
  const updateItem = (i: number, field: string, val: string | number) => {
    setOrderForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        items[i].total = items[i].quantity * items[i].unitPrice;
      }
      return { ...f, items };
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Mua sam / Nha cung cap</h1>
        </div>
        <div className="flex gap-2">
          {tab === 'orders' && (
            <button onClick={() => setShowOrderModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Tao don mua
            </button>
          )}
          {tab === 'suppliers' && (
            <button onClick={() => { setEditingSupId(null); setSupplierForm({ code: '', name: '', contactName: '', phone: '', email: '', address: '' }); setShowSupplierModal(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Them nha cung cap
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['orders', 'suppliers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'orders' ? 'Don mua hang' : 'Nha cung cap'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Nha cung cap', 'Tong tien', 'Trang thai', 'Ngay dat', 'Ngay nhan', 'Hanh dong'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Dang tai...</td></tr>
              ) : orders.map((o: Record<string, unknown>) => (
                <tr key={o.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{(o.supplier as Record<string, string>)?.name}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{(o.totalAmount as number).toLocaleString('vi-VN')}d</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[o.status as string] || 'bg-gray-100 text-gray-600'}`}>{o.status as string}</span></td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(o.orderedAt as string), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-gray-500">{o.receivedAt ? format(new Date(o.receivedAt as string), 'dd/MM/yyyy') : '-'}</td>
                  <td className="px-4 py-3">
                    {o.status === 'DRAFT' && (
                      <button onClick={() => updateOrderStatus.mutate({ id: o.id as string, status: 'SENT' })}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Gui don</button>
                    )}
                    {o.status === 'SENT' && (
                      <button onClick={() => updateOrderStatus.mutate({ id: o.id as string, status: 'RECEIVED' })}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Xac nhan nhan</button>
                    )}
                  </td>
                </tr>
              ))}
              {!ordersLoading && !orders.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chua co don mua hang</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Ma', 'Ten nha cung cap', 'Nguoi lien he', 'Dien thoai', 'Email', 'Hanh dong'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliersLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Dang tai...</td></tr>
              ) : suppliers.map((s: Record<string, string>) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.code}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.contactName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSupplier(s)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Sua</button>
                      <button onClick={() => deleteSupplierMut.mutate(s.id)} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Xoa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!suppliersLoading && !suppliers.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chua co nha cung cap</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal open={showOrderModal} onClose={() => setShowOrderModal(false)} title="Tao don mua hang">
        <div className="space-y-4">
          <div>
            <label className="label">Nha cung cap</label>
            <select className="input" value={orderForm.supplierId} onChange={e => setOrderForm(f => ({ ...f, supplierId: e.target.value }))}>
              <option value="">-- Chon nha cung cap --</option>
              {suppliers.map((s: Record<string, string>) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Danh sach hang hoa</label>
            {orderForm.items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input className="input col-span-2" placeholder="Ten hang" value={item.itemName} onChange={e => updateItem(i, 'itemName', e.target.value)} />
                <input type="number" className="input" placeholder="SL" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                <input type="number" className="input" placeholder="Don gia" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-primary hover:underline">+ Them dong</button>
          </div>
          <div><label className="label">Ghi chu</label><textarea className="input" rows={2} value={orderForm.note} onChange={e => setOrderForm(f => ({ ...f, note: e.target.value }))} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowOrderModal(false)} className="btn-secondary">Huy</button>
            <button onClick={() => createOrderMut.mutate(orderForm)} disabled={createOrderMut.isLoading} className="btn-primary">
              {createOrderMut.isLoading ? 'Dang luu...' : 'Tao don'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Supplier Modal */}
      <Modal open={showSupplierModal} onClose={() => { setShowSupplierModal(false); setEditingSupId(null); }} title={editingSupId ? 'Sua nha cung cap' : 'Them nha cung cap'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Ma NCC</label><input className="input" value={supplierForm.code} onChange={e => setSupplierForm(f => ({ ...f, code: e.target.value }))} /></div>
            <div><label className="label">Ten NCC</label><input className="input" value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nguoi lien he</label><input className="input" value={supplierForm.contactName} onChange={e => setSupplierForm(f => ({ ...f, contactName: e.target.value }))} /></div>
            <div><label className="label">Dien thoai</label><input className="input" value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div><label className="label">Email</label><input className="input" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Dia chi</label><input className="input" value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowSupplierModal(false); setEditingSupId(null); }} className="btn-secondary">Huy</button>
            <button onClick={handleSubmitSupplier} disabled={createSupplierMut.isLoading || updateSupplierMut.isLoading} className="btn-primary">
              {(createSupplierMut.isLoading || updateSupplierMut.isLoading) ? 'Dang luu...' : (editingSupId ? 'Cap nhat' : 'Them')}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
