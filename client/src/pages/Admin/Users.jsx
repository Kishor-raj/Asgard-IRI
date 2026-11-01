import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getAdminUsers, getPendingUsers, approveUser, rejectUser } from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const roleList = [
  'all',
  'super_admin',
  'foundation_admin',
  'researcher',
  'author',
  'reviewer',
  'participant_applicant',
  'trainer_mentor',
  'content_editor',
  'journal_editor',
  'conference_admin',
  'academy_admin',
  'publication_editor',
  'technology_lab_admin',
  'innovation_admin',
  'careers_hr_admin',
  'research_admin',
];

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Pending users
  const {
    data: pendingData,
    loading: loadingPending,
    refetch: refetchPending,
  } = useFetch(getPendingUsers);
  const pendingUsers = pendingData?.data || [];

  // All users
  const {
    data: allData,
    loading: loadingAll,
    refetch: refetchAll,
  } = useFetch(
    () =>
      getAdminUsers({
        search,
        role: selectedRole === 'all' ? '' : selectedRole,
      }),
    [search, selectedRole]
  );
  const allUsers = allData?.data || [];

  const handleApprove = async (id, name) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await approveUser(id);
      setFeedback({ type: 'success', message: `Approved user: ${name}` });
      refetchPending();
      refetchAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to approve user.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reject the application for ${name}?`)) return;
    setActionLoading(id);
    setFeedback(null);
    try {
      await rejectUser(id);
      setFeedback({ type: 'success', message: `Rejected user: ${name}` });
      refetchPending();
      refetchAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to reject user.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>User Access Management – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">User Management & Approvals</h1>
          <p className="text-xs text-grey-500 mt-1">
            Govern institutional roles, approve incoming registrations, and inspect identity records
          </p>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex justify-between items-center ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-grey-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-gold text-navy'
              : 'border-transparent text-grey-500 hover:text-navy'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-gold text-navy'
              : 'border-transparent text-grey-500 hover:text-navy'
          }`}
        >
          <span>All Registered Users</span>
          <span className="bg-grey-100 text-grey-600 text-[10px] px-2 py-0.5 rounded-full">
            {allUsers.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' ? (
        <Card className="overflow-hidden">
          <div className="p-4 bg-grey-50 border-b border-grey-200 flex justify-between items-center">
            <h2 className="text-xs font-semibold text-navy uppercase tracking-wider">
              Awaiting Verification ({pendingUsers.length})
            </h2>
            <Button variant="outline" size="sm" onClick={refetchPending}>
              Refresh
            </Button>
          </div>

          {loadingPending ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No pending user approvals at this time. All registrations are processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Requested Role</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy">{u.full_name}</td>
                      <td className="py-3 px-4 text-grey-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge label={u.role.replace('_', ' ')} variant="gold" />
                      </td>
                      <td className="py-3 px-4 text-grey-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionLoading === u.id}
                          onClick={() => handleApprove(u.id, u.full_name)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === u.id}
                          onClick={() => handleReject(u.id, u.full_name)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 bg-grey-50 border-b border-grey-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-grey-200 rounded-lg bg-white w-full focus:outline-none focus:border-navy"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-grey-500">Filter Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs border border-grey-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-navy"
              >
                {roleList.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingAll ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : allUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy">{u.full_name}</div>
                        <div className="text-[11px] text-grey-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={u.role?.replace('_', ' ')} variant="default" />
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          label={u.status?.toUpperCase()}
                          variant={u.status === 'active' ? 'open' : u.status === 'pending' ? 'gold' : 'closed'}
                        />
                      </td>
                      <td className="py-3 px-4 text-grey-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
