'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaveBalance {
  employee_id: string;
  vacation_balance: number;
  vacation_used: number;
  sick_balance: number;
  sick_used: number;
  personal_balance: number;
  personal_used: number;
}

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmployeeId, setSearchEmployeeId] = useState('');
  const [filteredBalances, setFilteredBalances] = useState<LeaveBalance[]>([]);
  const [exporting, setExporting] = useState(false);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/leaves/balances`);

      if (!response.ok) {
        throw new Error('Failed to fetch leave balances');
      }

      const data = await response.json();
      setBalances(data);
      setFilteredBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  useEffect(() => {
    if (searchEmployeeId) {
      setFilteredBalances(
        balances.filter((balance) =>
          balance.employee_id.toLowerCase().includes(searchEmployeeId.toLowerCase())
        )
      );
    } else {
      setFilteredBalances(balances);
    }
  }, [searchEmployeeId, balances]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/leaves/balances/export`);

      if (!response.ok) {
        throw new Error('Failed to export leave balances');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_balances_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const calculateRemaining = (balance: number, used: number) => balance - used;

  const getBalanceColor = (remaining: number, total: number) => {
    if (total === 0) return 'text-gray-600';
    const percentage = (remaining / total) * 100;
    if (percentage <= 25) return 'text-red-600 font-semibold';
    if (percentage <= 50) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Leave Balance Tracking</h1>
            <div className="flex gap-3">
              <Link
                href="/employees"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back to Employees
              </Link>
              <button
                onClick={handleExport}
                disabled={exporting || balances.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            View and track leave balances for all employees
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Employee ID
              </label>
              <input
                type="text"
                value={searchEmployeeId}
                onChange={(e) => setSearchEmployeeId(e.target.value)}
                placeholder="Enter employee ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leave balances...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchBalances}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredBalances.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {searchEmployeeId
                ? 'No employees found matching your search.'
                : 'No leave balance data available.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                      Vacation Days
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                      Sick Days
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                      Personal Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <th></th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Used</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Remaining</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Used</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Remaining</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Used</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500">Remaining</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBalances.map((balance) => (
                    <tr key={balance.employee_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {balance.employee_id}
                      </td>
                      {/* Vacation Days */}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.vacation_balance}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.vacation_used}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-center ${getBalanceColor(
                        calculateRemaining(balance.vacation_balance, balance.vacation_used),
                        balance.vacation_balance
                      )}`}>
                        {calculateRemaining(balance.vacation_balance, balance.vacation_used)}
                      </td>
                      {/* Sick Days */}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.sick_balance}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.sick_used}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-center ${getBalanceColor(
                        calculateRemaining(balance.sick_balance, balance.sick_used),
                        balance.sick_balance
                      )}`}>
                        {calculateRemaining(balance.sick_balance, balance.sick_used)}
                      </td>
                      {/* Personal Days */}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.personal_balance}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {balance.personal_used}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-center ${getBalanceColor(
                        calculateRemaining(balance.personal_balance, balance.personal_used),
                        balance.personal_balance
                      )}`}>
                        {calculateRemaining(balance.personal_balance, balance.personal_used)}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <Link
                          href={`/leave-balances/${balance.employee_id}`}
                          className="hover:underline"
                        >
                          View History
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBalances.length} employee{filteredBalances.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
