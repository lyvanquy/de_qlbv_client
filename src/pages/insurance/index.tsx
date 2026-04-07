import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/axios';

// Types
interface PolicyForm {
  patientId: string;
  provider: string;
  policyNumber: string;
  coverageAmount: string;
  validFrom: string;
  validTo: string;
  type: string;
}

interface ClaimForm {
  billId: string;
  claimAmount: string;
  diagnosis: string;
  note: string;
}

type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

const CLAIM_STATUS_COLOR: Record<ClaimStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PAID: 'bg-purple-100 text-purple-700',
};

const INITIAL_POLICY_FORM: PolicyForm = {
  patientId: '',
  provider: '',
  policyNumber: '',
  coverageAmount: '',
  validFrom: '',
  validTo: '',
  type: 'BHYT',
};

const INITIAL_CLAIM_FORM: ClaimForm = {
  billId: '',
  claimAmount: '',
  diagnosis: '',
  note: '',
};

export default function InsurancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'policies' | 'claims'>('policies');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [policyForm, setPolicyForm] = useState<PolicyForm>(INITIAL_POLICY_FORM);
  const [claimForm, setClaimForm] = useState<ClaimForm>(INITIAL_CLAIM_FORM);

  // Queries
  const { data: policiesData, isLoading: policiesLoading } = useQuery(
    'insurance-policies',
    () => api.get('/insurance/policies').then((r) => r.data.data)
  );

  const { data: claimsData, isLoading: claimsLoading } = useQuery(
    'insurance-claims',
    () => api.get('/insurance/claims').then((r) => r.data.data)
  );

  // Mutations
  const createPolicyMut = useMutation(
    (data: PolicyForm) => api.post('/insurance/policies', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('insurance-policies');
        setShowPolicyModal(false);
        setPolicyForm(INITIAL_POLICY_FORM);
        toast.success('Thêm bảo hiểm thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const deletePolicyMut = useMutation(
    (id: string) => api.delete(`/insurance/policies/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries('insurance-policies');
        toast.success('Xóa bảo hiểm thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const createClaimMut = useMutation(
    (data: ClaimForm) => api.post('/insurance/claims', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('insurance-claims');
        setShowClaimModal(false);
        setClaimForm(INITIAL_CLAIM_FORM);
        toast.success('Tạo yêu cầu bồi thường thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const updateClaimStatusMut = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      api.patch(`/insurance/claims/${id}/status`, { status }),
    {
      onSuccess: () => {
        qc.invalidateQueries('insurance-claims');
        toast.success('Cập nhật trạng thái thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const deleteClaimMut = useMutation(
    (id: string) => api.delete(`/insurance/claims/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries('insurance-claims');
        toast.success('Xóa yêu cầu thành công');
      },
      onError: () => { toast.error('Có lỗi xảy ra'); },
    }
  );

  const policies = policiesData || [];
  const claims = claimsData || [];

  const handleDeletePolicy = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa hợp đồng bảo hiểm này?')) {
      deletePolicyMut.mutate(id);
    }
  };

  const handleDeleteClaim = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa yêu cầu bồi thường này?')) {
      deleteClaimMut.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bảo hiểm</h1>
        </div>
        <button
          onClick={() =>
            tab === 'policies' ? setShowPolicyModal(true) : setShowClaimModal(true)
          }
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          {tab === 'policies' ? 'Thêm bảo hiểm' : 'Tạo yêu cầu bồi thường'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('policies')}
          className={`px-4 py-2 rounded ${
            tab === 'policies' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Hợp đồng bảo hiểm
        </button>
        <button
          onClick={() => setTab('claims')}
          className={`px-4 py-2 rounded ${
            tab === 'claims' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Yêu cầu bồi thường
        </button>
      </div>

      {tab === 'policies' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'Bệnh nhân',
                  'Nhà cung cấp',
                  'Số hợp đồng',
                  'Loại',
                  'Số tiền',
                  'Hiệu lực từ',
                  'Đến',
                  'Hành động',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policiesLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Chưa có hợp đồng bảo hiểm
                  </td>
                </tr>
              ) : (
                policies.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.patient?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.policyNumber}</td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">
                      {p.coverageAmount?.toLocaleString() || 0} đ
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(p.validFrom), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(p.validTo), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeletePolicy(p.id)}
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

      {tab === 'claims' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'Bệnh nhân',
                  'Số tiền yêu cầu',
                  'Chẩn đoán',
                  'Trạng thái',
                  'Ngày tạo',
                  'Hành động',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claimsLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có yêu cầu bồi thường
                  </td>
                </tr>
              ) : (
                claims.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{c.bill?.patient?.name || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold">
                      {c.claimAmount?.toLocaleString() || 0} đ
                    </td>
                    <td className="px-4 py-3">{c.diagnosis || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          CLAIM_STATUS_COLOR[c.status as ClaimStatus]
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(c.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {c.status === 'DRAFT' && (
                          <button
                            onClick={() =>
                              updateClaimStatusMut.mutate({
                                id: c.id,
                                status: 'SUBMITTED',
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Gửi
                          </button>
                        )}
                        {c.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() =>
                                updateClaimStatusMut.mutate({
                                  id: c.id,
                                  status: 'APPROVED',
                                })
                              }
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                updateClaimStatusMut.mutate({
                                  id: c.id,
                                  status: 'REJECTED',
                                })
                              }
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteClaim(c.id)}
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
      )}

      {/* Policy Modal */}
      <Modal
        open={showPolicyModal}
        onClose={() => {
          setShowPolicyModal(false);
          setPolicyForm(INITIAL_POLICY_FORM);
        }}
        title="Thêm hợp đồng bảo hiểm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mã bệnh nhân</label>
            <input
              type="text"
              className="input"
              value={policyForm.patientId}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, patientId: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Nhà cung cấp</label>
            <input
              type="text"
              className="input"
              value={policyForm.provider}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, provider: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Số hợp đồng</label>
            <input
              type="text"
              className="input"
              value={policyForm.policyNumber}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, policyNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Loại bảo hiểm</label>
            <select
              className="input"
              value={policyForm.type}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, type: e.target.value })
              }
            >
              <option value="BHYT">BHYT</option>
              <option value="BHTN">BHTN</option>
              <option value="Khac">Khác</option>
            </select>
          </div>
          <div>
            <label className="label">Số tiền bảo hiểm</label>
            <input
              type="number"
              className="input"
              value={policyForm.coverageAmount}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, coverageAmount: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hiệu lực từ</label>
              <input
                type="date"
                className="input"
                value={policyForm.validFrom}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, validFrom: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Đến</label>
              <input
                type="date"
                className="input"
                value={policyForm.validTo}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, validTo: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowPolicyModal(false);
                setPolicyForm(INITIAL_POLICY_FORM);
              }}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={() => createPolicyMut.mutate(policyForm)}
              disabled={createPolicyMut.isLoading}
              className="btn-primary"
            >
              {createPolicyMut.isLoading ? 'Đang xử lý...' : 'Thêm'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Claim Modal */}
      <Modal
        open={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setClaimForm(INITIAL_CLAIM_FORM);
        }}
        title="Tạo yêu cầu bồi thường"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mã hóa đơn</label>
            <input
              type="text"
              className="input"
              value={claimForm.billId}
              onChange={(e) =>
                setClaimForm({ ...claimForm, billId: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Số tiền yêu cầu</label>
            <input
              type="number"
              className="input"
              value={claimForm.claimAmount}
              onChange={(e) =>
                setClaimForm({ ...claimForm, claimAmount: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Chẩn đoán</label>
            <input
              type="text"
              className="input"
              value={claimForm.diagnosis}
              onChange={(e) =>
                setClaimForm({ ...claimForm, diagnosis: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Ghi chú</label>
            <textarea
              className="input"
              value={claimForm.note}
              onChange={(e) =>
                setClaimForm({ ...claimForm, note: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowClaimModal(false);
                setClaimForm(INITIAL_CLAIM_FORM);
              }}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={() => createClaimMut.mutate(claimForm)}
              disabled={createClaimMut.isLoading}
              className="btn-primary"
            >
              {createClaimMut.isLoading ? 'Đang xử lý...' : 'Tạo'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
