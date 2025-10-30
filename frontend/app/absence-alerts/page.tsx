'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface AbsenceAlert {
  _id: string;
  employee_id: string;
  absence_date: string;
  status: 'unexcused' | 'excused' | 'pending_review';
  reason?: string;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notification_sent: boolean;
  notification_channels: string[];
  createdAt?: string;
}

interface AbsenceStatistics {
  total: number;
  unexcused: number;
  excused: number;
  pending_review: number;
  notification_sent_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AbsenceAlertsPage() {
  const [alerts, setAlerts] = useState<AbsenceAlert[]>([]);
  const [statistics, setStatistics] = useState<AbsenceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detecting, setDetecting] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AbsenceAlert | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    reason: '',
    notes: '',
    reviewed_by: 'hr_admin',
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `${API_URL}/notifications/absence-alerts?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch absence alerts');
      }

      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/absence-alerts/statistics`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, [fetchAlerts, fetchStatistics]);

  const detectAbsences = async () => {
    try {
      setDetecting(true);
      setError(null);

      const response = await fetch(`${API_URL}/notifications/detect-absences`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to detect absences');
      }

      const result = await response.json();
      alert(result.message);

      // Refresh the lists
      await fetchAlerts();
      await fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDetecting(false);
    }
  };

  const openUpdateModal = (alert: AbsenceAlert) => {
    setSelectedAlert(alert);
    setUpdateForm({
      status: alert.status,
      reason: alert.reason || '',
      notes: alert.notes || '',
      reviewed_by: alert.reviewed_by || 'hr_admin',
    });
  };

  const closeUpdateModal = () => {
    setSelectedAlert(null);
    setUpdateForm({
      status: '',
      reason: '',
      notes: '',
      reviewed_by: 'hr_admin',
    });
  };

  const updateAlert = async () => {
    if (!selectedAlert) return;

    try {
      const response = await fetch(
        `${API_URL}/notifications/absence-alerts/${selectedAlert._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateForm),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      alert('Alert updated successfully');
      closeUpdateModal();
      await fetchAlerts();
      await fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unexcused':
        return 'text-red-600 bg-red-50';
      case 'excused':
        return 'text-green-600 bg-green-50';
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Absence Detection & Alerts
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage employee absences in real-time
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={detectAbsences}
                disabled={detecting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {detecting ? 'Detecting...' : 'Detect Absences'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Alerts
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.total}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-red-600">Unexcused</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {statistics.unexcused}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-green-600">Excused</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {statistics.excused}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-yellow-600">
                  Pending Review
                </h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {statistics.pending_review}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-blue-600">
                  Notifications Sent
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {statistics.notification_sent_count}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unexcused">Unexcused</option>
              <option value="excused">Excused</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No absence alerts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absence Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alert.employee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alert.absence_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}
                        >
                          {alert.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.notification_sent ? (
                          <span className="text-green-600">
                            ✓ Sent via {alert.notification_channels.join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not sent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.reviewed_by || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUpdateModal(alert)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Absence Alert
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={selectedAlert.employee_id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Absence Date
                </label>
                <input
                  type="text"
                  value={new Date(selectedAlert.absence_date).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unexcused">Unexcused</option>
                  <option value="excused">Excused</option>
                  <option value="pending_review">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={updateForm.reason}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, reason: e.target.value })
                  }
                  placeholder="e.g., Medical emergency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, notes: e.target.value })
                  }
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewed By
                </label>
                <input
                  type="text"
                  value={updateForm.reviewed_by}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      reviewed_by: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={updateAlert}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={closeUpdateModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
