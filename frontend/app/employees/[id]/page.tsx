'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  base_salary: number;
  hire_date: string;
  status: string;
}

interface AuditLog {
  entity_type: string;
  entity_id: string;
  action: string;
  changes: Record<string, unknown>;
  previous_values?: Record<string, unknown>;
  performed_by: string;
  reason?: string;
  createdAt: string;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/employees/${resolvedParams.id}`);
      
      if (!response.ok) {
        throw new Error('Employee not found');
      }
      
      const data = await response.json();
      setEmployee(data);
      setEditedEmployee(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, resolvedParams.id]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/employees/${resolvedParams.id}/audit-logs`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  }, [apiUrl, resolvedParams.id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  useEffect(() => {
    if (showAuditLogs && auditLogs.length === 0) {
      fetchAuditLogs();
    }
  }, [showAuditLogs, auditLogs.length, fetchAuditLogs]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(employee || {});
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaveError(null);
      setSaveSuccess(false);

      // Prepare update data (exclude hire_date as it's historical data)
      const updateData: Record<string, unknown> = {};
      if (editedEmployee.first_name !== employee?.first_name) updateData.first_name = editedEmployee.first_name;
      if (editedEmployee.last_name !== employee?.last_name) updateData.last_name = editedEmployee.last_name;
      if (editedEmployee.email !== employee?.email) updateData.email = editedEmployee.email;
      if (editedEmployee.department !== employee?.department) updateData.department = editedEmployee.department;
      if (editedEmployee.position !== employee?.position) updateData.position = editedEmployee.position;
      if (editedEmployee.base_salary !== employee?.base_salary) updateData.base_salary = editedEmployee.base_salary;
      if (editedEmployee.status !== employee?.status) updateData.status = editedEmployee.status;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(`${apiUrl}/employees/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update employee');
      }

      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setEditedEmployee(updatedEmployee);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Refresh audit logs
      fetchAuditLogs();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleDeactivate = async () => {
    try {
      const response = await fetch(`${apiUrl}/employees/${resolvedParams.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: deactivateReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to deactivate employee');
      }

      const deactivatedEmployee = await response.json();
      setEmployee(deactivatedEmployee);
      setEditedEmployee(deactivatedEmployee);
      setShowDeactivateModal(false);
      setDeactivateReason('');
      
      // Refresh audit logs
      fetchAuditLogs();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to deactivate employee');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Employee not found'}</p>
          <Link href="/employees" className="text-blue-600 hover:underline">
            Back to Employee List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/employees" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Employee List
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-600">{employee.employee_id}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(employee.status)}`}>
              {employee.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            Employee information updated successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {saveError}
          </div>
        )}

        {/* Employee Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Employee Information</h2>
            {!isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                {employee.status === 'active' && (
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmployee.first_name || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmployee.last_name || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedEmployee.email || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmployee.department || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmployee.position || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.position}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedEmployee.base_salary || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, base_salary: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formatCurrency(employee.base_salary)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
              <p className="text-gray-900">{formatDate(employee.hire_date)}</p>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">* Historical data cannot be edited</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {isEditing ? (
                <select
                  value={editedEmployee.status || ''}
                  onChange={(e) => setEditedEmployee({ ...editedEmployee, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              ) : (
                <p className="text-gray-900">{employee.status.replace('_', ' ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Change History</h2>
            <button
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className="text-blue-600 hover:underline"
            >
              {showAuditLogs ? 'Hide' : 'Show'} History
            </button>
          </div>

          {showAuditLogs && (
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <p className="text-gray-600">No change history available.</p>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900 capitalize">{log.action}</span>
                      <span className="text-sm text-gray-500">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">By: {log.performed_by}</p>
                    {log.reason && (
                      <p className="text-sm text-gray-600 mb-1">Reason: {log.reason}</p>
                    )}
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="text-sm text-gray-700 mt-2">
                        <p className="font-medium">Changes:</p>
                        <ul className="list-disc list-inside ml-2">
                          {Object.entries(log.changes).map(([key, value]) => (
                            <li key={key}>
                              {key}: {log.previous_values?.[key] !== undefined ? (
                                <>
                                  <span className="line-through text-red-600">{String(log.previous_values[key])}</span>
                                  {' → '}
                                  <span className="text-green-600">{String(value)}</span>
                                </>
                              ) : (
                                <span className="text-green-600">{String(value)}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Deactivate Employee</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deactivate {employee.first_name} {employee.last_name}?
              This action can be reversed by editing the employee status.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivateReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
