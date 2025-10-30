'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Holiday {
  _id: string;
  date: string;
  name: string;
  description?: string;
  is_paid: boolean;
  is_recurring: boolean;
  recurring_month?: number;
  recurring_day?: number;
  createdAt: string;
  updatedAt: string;
}

interface HolidayFormData {
  date: string;
  name: string;
  description: string;
  is_paid: boolean;
  is_recurring: boolean;
  recurring_month: string;
  recurring_day: string;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterRecurring, setFilterRecurring] = useState<'all' | 'recurring' | 'non-recurring'>('all');

  const [formData, setFormData] = useState<HolidayFormData>({
    date: '',
    name: '',
    description: '',
    is_paid: true,
    is_recurring: false,
    recurring_month: '',
    recurring_day: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (filterRecurring !== 'all') {
        params.append('is_recurring', filterRecurring === 'recurring' ? 'true' : 'false');
      }

      const response = await fetch(`${apiUrl}/salary/holidays?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      
      const data = await response.json();
      setHolidays(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startDate, endDate, filterRecurring]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      interface HolidayPayload {
        date: string;
        name: string;
        description?: string;
        is_paid: boolean;
        is_recurring: boolean;
        recurring_month?: number;
        recurring_day?: number;
      }

      const payload: HolidayPayload = {
        date: formData.date,
        name: formData.name,
        description: formData.description || undefined,
        is_paid: formData.is_paid,
        is_recurring: formData.is_recurring,
      };

      if (formData.is_recurring && formData.recurring_month && formData.recurring_day) {
        payload.recurring_month = parseInt(formData.recurring_month);
        payload.recurring_day = parseInt(formData.recurring_day);
      }

      let response;
      if (editingHoliday) {
        // Update existing holiday
        response = await fetch(`${apiUrl}/salary/holidays/${editingHoliday._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || undefined,
            is_paid: formData.is_paid,
            is_recurring: formData.is_recurring,
            recurring_month: formData.is_recurring && formData.recurring_month ? parseInt(formData.recurring_month) : undefined,
            recurring_day: formData.is_recurring && formData.recurring_day ? parseInt(formData.recurring_day) : undefined,
          }),
        });
      } else {
        // Create new holiday
        response = await fetch(`${apiUrl}/salary/holidays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(editingHoliday ? 'Failed to update holiday' : 'Failed to create holiday');
      }

      // Reset form and refresh
      setFormData({
        date: '',
        name: '',
        description: '',
        is_paid: true,
        is_recurring: false,
        recurring_month: '',
        recurring_day: '',
      });
      setShowForm(false);
      setEditingHoliday(null);
      fetchHolidays();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: holiday.date.split('T')[0],
      name: holiday.name,
      description: holiday.description || '',
      is_paid: holiday.is_paid,
      is_recurring: holiday.is_recurring,
      recurring_month: holiday.recurring_month?.toString() || '',
      recurring_day: holiday.recurring_day?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/salary/holidays/by-id/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      fetchHolidays();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGenerateRecurring = async () => {
    if (!confirm(`Generate recurring holidays for ${selectedYear}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/salary/holidays/generate/${selectedYear}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate recurring holidays');
      }

      const result = await response.json();
      alert(result.message);
      fetchHolidays();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getCalendarDays = () => {
    const year = selectedYear;
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      months.push({
        name: firstDay.toLocaleString('default', { month: 'long' }),
        days: daysInMonth,
        startingDay: startingDayOfWeek,
        month: month,
      });
    }
    
    return months;
  };

  const isHoliday = (year: number, month: number, day: number) => {
    return holidays.find(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.getFullYear() === year &&
             holidayDate.getMonth() === month &&
             holidayDate.getDate() === day;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Holiday Management</h1>
              <p className="text-gray-600 mt-1">Manage company holidays and legal days off</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setEditingHoliday(null);
                setFormData({
                  date: '',
                  name: '',
                  description: '',
                  is_paid: true,
                  is_recurring: false,
                  recurring_month: '',
                  recurring_day: '',
                });
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Holiday'}
            </button>
            
            <button
              onClick={handleGenerateRecurring}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Generate Recurring for {selectedYear}
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {viewMode === 'list' ? '📅 Calendar View' : '📋 List View'}
            </button>
          </div>
        </div>

        {/* Holiday Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Christmas Day"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_paid}
                      onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Paid Holiday</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring Holiday</span>
                  </label>
                </div>

                {formData.is_recurring && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Month (1-12)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.recurring_month}
                        onChange={(e) => setFormData({ ...formData, recurring_month: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 12 for December"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Day (1-31)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.recurring_day}
                        onChange={(e) => setFormData({ ...formData, recurring_day: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 25"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHoliday(null);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurring
                </label>
                <select
                  value={filterRecurring}
                  onChange={(e) => setFilterRecurring(e.target.value as 'all' | 'recurring' | 'non-recurring')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All</option>
                  <option value="recurring">Recurring Only</option>
                  <option value="non-recurring">Non-Recurring Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setFilterRecurring('all');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Calendar View - {selectedYear}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  ← {selectedYear - 1}
                </button>
                <button
                  onClick={() => setSelectedYear(new Date().getFullYear())}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {selectedYear + 1} →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getCalendarDays().map((month) => (
                <div key={month.name} className="border rounded-lg p-3">
                  <h3 className="font-semibold text-center mb-2">{month.name}</h3>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: month.startingDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: month.days }).map((_, i) => {
                      const day = i + 1;
                      const holiday = isHoliday(selectedYear, month.month, day);
                      return (
                        <div
                          key={day}
                          className={`text-center p-1 rounded ${
                            holiday
                              ? 'bg-red-100 text-red-800 font-semibold'
                              : 'hover:bg-gray-100'
                          }`}
                          title={holiday ? holiday.name : ''}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holidays List */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Holidays ({holidays.length})
              </h2>

              {loading && (
                <div className="text-center py-8 text-gray-500">Loading holidays...</div>
              )}

              {error && (
                <div className="text-center py-8 text-red-600">{error}</div>
              )}

              {!loading && !error && holidays.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No holidays found. Add your first holiday!
                </div>
              )}

              {!loading && !error && holidays.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Recurring
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {holidays.map((holiday) => (
                        <tr key={holiday._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(holiday.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {holiday.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {holiday.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                holiday.is_paid
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {holiday.is_paid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {holiday.is_recurring ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {holiday.recurring_month}/{holiday.recurring_day}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(holiday)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(holiday._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
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
        )}
      </div>
    </div>
  );
}
