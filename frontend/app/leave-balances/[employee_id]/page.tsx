'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface LeaveBalance {
  employee_id: string;
  vacation_balance: number;
  vacation_used: number;
  sick_balance: number;
  sick_used: number;
  personal_balance: number;
  personal_used: number;
}

interface Leave {
  _id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
}

export default function EmployeeLeaveHistoryPage() {
  const params = useParams();
  const employee_id = params.employee_id as string;

  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch balance
        const balanceResponse = await fetch(
          `${apiUrl}/leaves/balance/${employee_id}`
        );
        if (!balanceResponse.ok) {
          throw new Error('Failed to fetch leave balance');
        }
        const balanceData = await balanceResponse.json();
        setBalance(balanceData);

        // Fetch leave history
        const leavesResponse = await fetch(
          `${apiUrl}/leaves?employee_id=${employee_id}&sortBy=start_date&sortOrder=desc`
        );
        if (!leavesResponse.ok) {
          throw new Error('Failed to fetch leave history');
        }
        const leavesData = await leavesResponse.json();
        setLeaves(leavesData.data || leavesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employee_id]);

  const calculateRemaining = (balanceValue: number, used: number) => balanceValue - used;

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Ensure end is after start
    if (end < start) {
      return 0;
    }
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vacation':
        return 'bg-blue-100 text-blue-800';
      case 'Sick':
        return 'bg-purple-100 text-purple-800';
      case 'Personal':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filterType && leave.leave_type !== filterType) return false;
    if (filterStatus && leave.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Leave History - {employee_id}
            </h1>
            <Link
              href="/leave-balances"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Leave Balances
            </Link>
          </div>
          <p className="text-gray-600">
            View leave balance and history for employee {employee_id}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leave data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Balance Summary */}
            {balance && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Current Leave Balance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Vacation */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">
                      Vacation Days
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-medium">{balance.vacation_balance}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Used: <span className="font-medium">{balance.vacation_used}</span>
                      </p>
                      <p className="text-sm text-gray-900 font-semibold">
                        Remaining:{' '}
                        <span className="text-blue-600">
                          {calculateRemaining(balance.vacation_balance, balance.vacation_used)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Sick */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-600 mb-2">
                      Sick Days
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-medium">{balance.sick_balance}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Used: <span className="font-medium">{balance.sick_used}</span>
                      </p>
                      <p className="text-sm text-gray-900 font-semibold">
                        Remaining:{' '}
                        <span className="text-purple-600">
                          {calculateRemaining(balance.sick_balance, balance.sick_used)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Personal */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                      Personal Days
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-medium">{balance.personal_balance}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Used: <span className="font-medium">{balance.personal_used}</span>
                      </p>
                      <p className="text-sm text-gray-900 font-semibold">
                        Remaining:{' '}
                        <span className="text-indigo-600">
                          {calculateRemaining(balance.personal_balance, balance.personal_used)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Filter Leave History
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Sick">Sick</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
              </div>
              {filteredLeaves.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No leave records found for this employee.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                                leave.leave_type
                              )}`}
                            >
                              {leave.leave_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(leave.start_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(leave.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {calculateDays(leave.start_date, leave.end_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                leave.status
                              )}`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {leave.reason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredLeaves.length} leave record
              {filteredLeaves.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
