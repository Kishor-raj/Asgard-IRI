import { useEffect, useState } from 'react';
import {
  CurrencyRupeeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getAdminPayments, adminRefundPayment, exportPaymentsCSV } from '../../services/admin.service';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getAdminPayments({
        status: statusFilter,
        search: searchTerm,
      });
      setPayments(res.data);
    } catch {
      toast.error('Failed to load payment transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportPaymentsCSV();
      toast.success('Payments CSV downloaded.');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundReason('Participant cancellation or fee adjustment');
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedPayment) return;
    setRefunding(true);
    try {
      await adminRefundPayment(selectedPayment.id, refundReason);
      toast.success('Payment successfully refunded.');
      setRefundModalOpen(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Refund failed.');
    } finally {
      setRefunding(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'open';
      case 'created':
        return 'review';
      case 'refunded':
        return 'closed';
      case 'failed':
        return 'closed';
      default:
        return 'open';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-grey-200">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">
            Payment & Gateway Transactions
          </h1>
          <p className="text-grey-500 text-xs mt-1">
            Real-time audit log of Razorpay orders, attendee registration fees, and refund management.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayments}>
            <ArrowPathIcon className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCSV} loading={exporting}>
            <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'created', 'refunded', 'failed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-navy text-white'
                    : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID / Email..."
              className="text-xs border border-grey-200 rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:border-navy"
            />
            <Button type="submit" variant="outline" size="sm">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-12">
          <Loader />
        </div>
      ) : payments.length === 0 ? (
        <Card className="p-12 text-center text-grey-400 text-sm">
          No payment transactions found matching the filter criteria.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-grey-50 border-b border-grey-200 text-grey-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Entity & Category</th>
                  <th className="py-3 px-4">Attendee / User</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-navy">{p.order_id}</td>
                    <td className="py-3 px-4 font-mono text-grey-500">
                      {p.payment_id || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-navy">
                        {p.entity_type?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-grey-400 block font-mono">
                        Ref #{p.entity_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-navy block">{p.user_name || 'Direct Delegate'}</span>
                      <span className="text-[11px] text-grey-500">{p.user_email || '—'}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-navy">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={p.status?.toUpperCase()} variant={getStatusBadgeVariant(p.status)} />
                    </td>
                    <td className="py-3 px-4 text-grey-500 whitespace-nowrap">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'paid' && (
                        <button
                          onClick={() => handleOpenRefund(p)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs hover:underline"
                        >
                          Refund
                        </button>
                      )}
                      {p.status === 'refunded' && (
                        <span className="text-grey-400 italic">Refunded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Refund Modal */}
      {refundModalOpen && selectedPayment && (
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title="Process Transaction Refund"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800 space-y-1">
              <div className="font-semibold text-sm">Caution: Refund Action</div>
              <p>
                Refunding Order <strong>{selectedPayment.order_id}</strong> (₹{selectedPayment.amount}) will update the registration record status and record an administrative audit entry.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-navy mb-1">Reason for Refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full border border-grey-200 rounded-lg p-3 text-xs focus:outline-none focus:border-navy"
                placeholder="Specify reason for refund..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
              <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="!bg-red-600 hover:!bg-red-700 text-white"
                onClick={handleConfirmRefund}
                loading={refunding}
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
