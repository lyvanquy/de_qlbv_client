import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Plus, TestTube, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';

// Types
interface TestForm {
  code: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  normalRange: string;
}

interface OrderForm {
  patientId: string;
  note: string;
  items: Array<{ testId: string }>;
}

type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_COLOR: Record<Status, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const INITIAL_TEST_FORM: TestForm = {
  code: '',
  name: '',
  category: '',
  price: '',
  unit: '',
  normalRange: '',
};

const INITIAL_ORDER_FORM: OrderForm = {
  patientId: '',
  note: '',
  items: [{ testId: '' }],
};

export default function LabPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'orders' | 'tests'>('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [search, setSearch] = useState('');
  const [orderForm, setOrderForm] = useState<OrderForm>(INITIAL_ORDER_FORM);
  const [testForm, setTestForm] = useState<TestForm>(INITIAL_TEST_FORM);

  // Queries
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'lab-orders',
    () => api.get('/lab/orders').then((r) => r.data.data)
  );

  const { data: testsData, isLoading: testsLoading } = useQuery(
    ['lab-tests', search],
    () => api.get('/lab/tests', { params: { search } }).then((r) => r.data.data)
  );

  // Mutations
  const createOrderMut = useMutation(
    (data: OrderForm) => {
      // Validate
      if (!data.patientId) {
        throw new Error('Vui lòng nhập mã bệnh nhân');
      }
      if (!data.items || data.items.length === 0 || !data.items[0].testId) {
        throw new Error('Vui lòng chọn ít nhất một xét nghiệm');
      }
      return api.post('/lab/orders', data);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('lab-orders');
        setShowOrderModal(false);
        setOrderForm(INITIAL_ORDER_FORM);
        toast.success('Tạo phiếu xét nghiệm thành công');
      },
      onError: (error: any) => {
        console.error('Error creating order:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const createTestMut = useMutation(
    (data: TestForm) => {
      // Validate
      if (!data.code || !data.name) {
        throw new Error('Vui lòng nhập đầy đủ mã và tên xét nghiệm');
      }
      // Convert price to number
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : 0,
      };
      return api.post('/lab/tests', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('lab-tests');
        setShowTestModal(false);
        setTestForm(INITIAL_TEST_FORM);
        toast.success('Thêm xét nghiệm thành công');
      },
      onError: (error: any) => {
        console.error('Error creating test:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      },
    }
  );

  const deleteTestMut = useMutation((id: string) => api.delete(`/lab/tests/${id}`), {
    onSuccess: () => {
      qc.invalidateQueries('lab-tests');
      toast.success('Xóa xét nghiệm thành công');
    },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const deleteOrderMut = useMutation((id: string) => api.delete(`/lab/orders/${id}`), {
    onSuccess: () => {
      qc.invalidateQueries('lab-orders');
      toast.success('Xóa phiếu thành công');
    },
    onError: () => { toast.error('Có lỗi xảy ra'); },
  });

  const orders = ordersData?.orders || [];
  const tests = testsData || [];

  const addTestItem = () => {
    setOrderForm((f) => ({ ...f, items: [...f.items, { testId: '' }] }));
  };

  const updateTestItem = (index: number, testId: string) => {
    setOrderForm((f) => {
      const items = [...f.items];
      items[index] = { testId };
      return { ...f, items };
    });
  };

  const removeTestItem = (index: number) => {
    setOrderForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteTest = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa xét nghiệm này?')) {
      deleteTestMut.mutate(id);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phiếu xét nghiệm này?')) {
      deleteOrderMut.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TestTube className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý xét nghiệm</h1>
        </div>
        <button
          onClick={() =>
            tab === 'orders' ? setShowOrderModal(true) : setShowTestModal(true)
          }
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          {tab === 'orders' ? 'Tạo phiếu XN' : 'Thêm xét nghiệm'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded ${
            tab === 'orders' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Phiếu xét nghiệm
        </button>
        <button
          onClick={() => setTab('tests')}
          className={`px-4 py-2 rounded ${
            tab === 'tests' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Danh mục XN
        </button>
      </div>

      {tab === 'orders' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mã BN', 'Tên BN', 'Ngày tạo', 'Trạng thái', 'Số XN', 'Hành động'].map(
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
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có phiếu xét nghiệm
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{o.patient?.patientCode || 'N/A'}</td>
                    <td className="px-4 py-3">{o.patient?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {format(new Date(o.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          STATUS_COLOR[o.status as Status]
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{o.items?.length || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteOrder(o.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tests' && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm xét nghiệm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Mã', 'Tên xét nghiệm', 'Danh mục', 'Giá', 'Đơn vị', 'Hành động'].map(
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
                {testsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : tests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Chưa có xét nghiệm
                    </td>
                  </tr>
                ) : (
                  tests.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{t.code}</td>
                      <td className="px-4 py-3">{t.name}</td>
                      <td className="px-4 py-3">{t.category || 'N/A'}</td>
                      <td className="px-4 py-3">{t.price?.toLocaleString() || 0} đ</td>
                      <td className="px-4 py-3">{t.unit || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteTest(t.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        open={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderForm(INITIAL_ORDER_FORM);
        }}
        title="Tạo phiếu xét nghiệm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mã bệnh nhân *</label>
            <input
              type="text"
              className="input"
              value={orderForm.patientId}
              onChange={(e) =>
                setOrderForm({ ...orderForm, patientId: e.target.value })
              }
              placeholder="Nhập mã bệnh nhân"
            />
          </div>
          <div>
            <label className="label">Ghi chú</label>
            <textarea
              className="input"
              value={orderForm.note}
              onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
              placeholder="Ghi chú (tùy chọn)"
            />
          </div>
          <div>
            <label className="label">Xét nghiệm *</label>
            {orderForm.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  className="input flex-1"
                  value={item.testId}
                  onChange={(e) => updateTestItem(i, e.target.value)}
                >
                  <option value="">Chọn xét nghiệm</option>
                  {tests.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.price?.toLocaleString() || 0} đ
                    </option>
                  ))}
                </select>
                {orderForm.items.length > 1 && (
                  <button
                    onClick={() => removeTestItem(i)}
                    className="btn-secondary px-3"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            <button onClick={addTestItem} className="text-primary text-sm mt-2">
              + Thêm xét nghiệm
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowOrderModal(false);
                setOrderForm(INITIAL_ORDER_FORM);
              }}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={() => createOrderMut.mutate(orderForm)}
              disabled={createOrderMut.isLoading}
              className="btn-primary"
            >
              {createOrderMut.isLoading ? 'Đang xử lý...' : 'Tạo'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Test Modal */}
      <Modal
        open={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestForm(INITIAL_TEST_FORM);
        }}
        title="Thêm xét nghiệm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mã *</label>
            <input
              type="text"
              className="input"
              value={testForm.code}
              onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
              placeholder="Ví dụ: XN001"
            />
          </div>
          <div>
            <label className="label">Tên xét nghiệm *</label>
            <input
              type="text"
              className="input"
              value={testForm.name}
              onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
              placeholder="Ví dụ: Xét nghiệm máu"
            />
          </div>
          <div>
            <label className="label">Danh mục</label>
            <input
              type="text"
              className="input"
              value={testForm.category}
              onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
              placeholder="Ví dụ: Hematology"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Giá</label>
              <input
                type="number"
                className="input"
                value={testForm.price}
                onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Đơn vị</label>
              <input
                type="text"
                className="input"
                value={testForm.unit}
                onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                placeholder="Ví dụ: g/L"
              />
            </div>
          </div>
          <div>
            <label className="label">Giá trị bình thường</label>
            <input
              type="text"
              className="input"
              value={testForm.normalRange}
              onChange={(e) =>
                setTestForm({ ...testForm, normalRange: e.target.value })
              }
              placeholder="Ví dụ: 4.5-5.5"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowTestModal(false);
                setTestForm(INITIAL_TEST_FORM);
              }}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={() => createTestMut.mutate(testForm)}
              disabled={createTestMut.isLoading}
              className="btn-primary"
            >
              {createTestMut.isLoading ? 'Đang xử lý...' : 'Thêm'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
