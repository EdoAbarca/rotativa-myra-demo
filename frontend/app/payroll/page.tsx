'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmployeePayrollEntry {
  employee_id: string;
  employee_name: string;
  base_salary: number;
  days_worked: number;
  working_days_in_period: number;
  absent_days: number;
  overtime_hours: number;
  holiday_days: number;
  daily_rate: number;
  hourly_rate: number;
  overtime_rate: number;
  base_salary_earned: number;
  overtime_earnings: number;
  absence_deductions: number;
  total_salary: number;
  warnings: string[];
  has_incomplete_data: boolean;
}

interface Payroll {
  _id: string;
  month: number;
  year: number;
  period_start: string;
  period_end: string;
  total_employees: number;
  employees_with_incomplete_data: number;
  total_base_salary: number;
  total_overtime: number;
  total_deductions: number;
  total_payroll: number;
  employee_entries: EmployeePayrollEntry[];
  status: string;
  generated_by?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatedBy, setGeneratedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [forceRegenerate, setForceRegenerate] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/salary/payroll?limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payrolls');
      }
      
      const result = await response.json();
      setPayrolls(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${apiUrl}/salary/payroll/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          generated_by: generatedBy || undefined,
          notes: notes || undefined,
          force_regenerate: forceRegenerate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate payroll');
      }

      const payroll = await response.json();
      setSuccess(`Payroll for ${monthNames[selectedMonth - 1]} ${selectedYear} generated successfully!`);
      setSelectedPayroll(payroll);
      
      // Reset form
      setGeneratedBy('');
      setNotes('');
      setForceRegenerate(false);
      
      // Refresh list
      fetchPayrolls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPayroll = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/salary/payroll/${year}/${month}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payroll details');
      }
      
      const payroll = await response.json();
      setSelectedPayroll(payroll);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async (month: number, year: number) => {
    try {
      setError(null);
      
      const response = await fetch(
        `${apiUrl}/salary/payroll/${year}/${month}/export`
      );
      
      if (!response.ok) {
        throw new Error('Failed to export payroll');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-${year}-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Payroll exported to Excel successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Monthly Payroll Generation</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-gray-600">
            Generate and manage monthly payroll reports for all employees
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Generate Payroll Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate New Payroll
          </h2>
          <form onSubmit={handleGeneratePayroll} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  min="2020"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generated By
                </label>
                <input
                  type="text"
                  value={generatedBy}
                  onChange={(e) => setGeneratedBy(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="forceRegenerate"
                checked={forceRegenerate}
                onChange={(e) => setForceRegenerate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="forceRegenerate" className="ml-2 text-sm text-gray-700">
                Force regenerate if payroll already exists
              </label>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {generating ? 'Generating...' : 'Generate Payroll'}
            </button>
          </form>
        </div>

        {/* Payroll History */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payroll History
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading payrolls...</p>
          ) : payrolls.length === 0 ? (
            <p className="text-gray-600">No payrolls generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Payroll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {monthNames[payroll.month - 1]} {payroll.year}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payroll.total_employees}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payroll.total_payroll)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payroll.employees_with_incomplete_data > 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {payroll.employees_with_incomplete_data} warnings
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Complete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewPayroll(payroll.month, payroll.year)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleExportToExcel(payroll.month, payroll.year)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Export Excel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payroll Details */}
        {selectedPayroll && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Payroll Details: {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
              </h2>
              <button
                onClick={() => setSelectedPayroll(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Employees</div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedPayroll.total_employees}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Base Salary</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedPayroll.total_base_salary)}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Overtime</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(selectedPayroll.total_overtime)}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Deductions</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(selectedPayroll.total_deductions)}
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <div className="text-lg text-gray-700">Total Payroll Amount</div>
              <div className="text-3xl font-bold text-indigo-600">
                {formatCurrency(selectedPayroll.total_payroll)}
              </div>
            </div>

            {selectedPayroll.employees_with_incomplete_data > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-yellow-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-yellow-800 font-semibold">
                    {selectedPayroll.employees_with_incomplete_data} employee(s) have incomplete data
                  </span>
                </div>
              </div>
            )}

            {/* Employee Breakdown */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Employee Salary Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Days Worked
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Base Earned
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Overtime
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deductions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPayroll.employee_entries.map((entry) => (
                    <tr
                      key={entry.employee_id}
                      className={entry.has_incomplete_data ? 'bg-yellow-50' : ''}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.employee_name}
                        </div>
                        <div className="text-sm text-gray-500">{entry.employee_id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.days_worked} / {entry.working_days_in_period}
                        {entry.absent_days > 0 && (
                          <span className="text-red-600 ml-1">
                            ({entry.absent_days} absent)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entry.base_salary_earned)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entry.overtime_earnings)}
                        {entry.overtime_hours > 0 && (
                          <span className="text-xs text-gray-500 block">
                            {entry.overtime_hours}h
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(entry.absence_deductions)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(entry.total_salary)}
                      </td>
                      <td className="px-4 py-4">
                        {entry.has_incomplete_data ? (
                          <div>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mb-1">
                              Warning
                            </span>
                            {entry.warnings.map((warning, index) => (
                              <div key={index} className="text-xs text-yellow-700 mt-1">
                                • {warning}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
