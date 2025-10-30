'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface DeductionRule {
  absence_type: string;
  deduction_percentage: number;
}

interface SalaryRule {
  _id: string;
  rule_name: string;
  description?: string;
  employee_category: string;
  overtime_multiplier: number;
  standard_hours_per_day: number;
  working_days_per_month: number;
  min_working_hours_per_month: number;
  max_working_hours_per_month: number;
  deduction_rules: DeductionRule[];
  default_deduction_percentage: number;
  status: string;
  effective_from: string;
  effective_to?: string;
  version: number;
  created_by?: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
}

interface SalaryRuleFormData {
  rule_name: string;
  description: string;
  employee_category: string;
  overtime_multiplier: string;
  standard_hours_per_day: string;
  working_days_per_month: string;
  min_working_hours_per_month: string;
  max_working_hours_per_month: string;
  default_deduction_percentage: string;
  status: string;
  effective_from: string;
  effective_to: string;
  deduction_rules: DeductionRule[];
}

export default function SalaryRulesPage() {
  const [rules, setRules] = useState<SalaryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<SalaryRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState<SalaryRuleFormData>({
    rule_name: '',
    description: '',
    employee_category: 'general',
    overtime_multiplier: '1.5',
    standard_hours_per_day: '8',
    working_days_per_month: '22',
    min_working_hours_per_month: '0',
    max_working_hours_per_month: '240',
    default_deduction_percentage: '100',
    status: 'active',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    deduction_rules: [],
  });

  const [newAbsenceType, setNewAbsenceType] = useState('');
  const [newDeductionPercentage, setNewDeductionPercentage] = useState('100');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterCategory) params.append('employee_category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`${apiUrl}/salary/rules?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch salary rules');
      }

      const data = await response.json();
      setRules(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, filterCategory, filterStatus]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        rule_name: formData.rule_name,
        description: formData.description || undefined,
        employee_category: formData.employee_category,
        overtime_multiplier: parseFloat(formData.overtime_multiplier),
        standard_hours_per_day: parseInt(formData.standard_hours_per_day),
        working_days_per_month: parseInt(formData.working_days_per_month),
        min_working_hours_per_month: parseInt(formData.min_working_hours_per_month),
        max_working_hours_per_month: parseInt(formData.max_working_hours_per_month),
        default_deduction_percentage: parseInt(formData.default_deduction_percentage),
        status: formData.status,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || undefined,
        deduction_rules: formData.deduction_rules,
        created_by: 'admin', // In production, this would come from auth
      };

      let response;
      if (editingRule) {
        // Update existing rule
        response = await fetch(`${apiUrl}/salary/rules/${editingRule.rule_name}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            updated_by: 'admin',
            change_reason: 'Updated via admin interface',
          }),
        });
      } else {
        // Create new rule
        response = await fetch(`${apiUrl}/salary/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save salary rule');
      }

      // Reset form and refresh
      resetForm();
      setShowForm(false);
      setEditingRule(null);
      fetchRules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      description: '',
      employee_category: 'general',
      overtime_multiplier: '1.5',
      standard_hours_per_day: '8',
      working_days_per_month: '22',
      min_working_hours_per_month: '0',
      max_working_hours_per_month: '240',
      default_deduction_percentage: '100',
      status: 'active',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      deduction_rules: [],
    });
  };

  const handleEdit = (rule: SalaryRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      description: rule.description || '',
      employee_category: rule.employee_category,
      overtime_multiplier: rule.overtime_multiplier.toString(),
      standard_hours_per_day: rule.standard_hours_per_day.toString(),
      working_days_per_month: rule.working_days_per_month.toString(),
      min_working_hours_per_month: rule.min_working_hours_per_month.toString(),
      max_working_hours_per_month: rule.max_working_hours_per_month.toString(),
      default_deduction_percentage: rule.default_deduction_percentage.toString(),
      status: rule.status,
      effective_from: rule.effective_from.split('T')[0],
      effective_to: rule.effective_to ? rule.effective_to.split('T')[0] : '',
      deduction_rules: rule.deduction_rules,
    });
    setShowForm(true);
  };

  const handleDelete = async (ruleName: string) => {
    if (!confirm('Are you sure you want to delete this salary rule?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/salary/rules/${ruleName}?deletedBy=admin`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete salary rule');
      }

      fetchRules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addDeductionRule = () => {
    if (!newAbsenceType) {
      alert('Please enter an absence type');
      return;
    }

    setFormData({
      ...formData,
      deduction_rules: [
        ...formData.deduction_rules,
        {
          absence_type: newAbsenceType,
          deduction_percentage: parseInt(newDeductionPercentage),
        },
      ],
    });

    setNewAbsenceType('');
    setNewDeductionPercentage('100');
  };

  const removeDeductionRule = (index: number) => {
    setFormData({
      ...formData,
      deduction_rules: formData.deduction_rules.filter((_, i) => i !== index),
    });
  };

  const initializeDefaults = async () => {
    try {
      const response = await fetch(`${apiUrl}/salary/rules/initialize-defaults`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize default rules');
      }

      alert('Default salary rules initialized successfully');
      fetchRules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Calculation Rules</h1>
            <p className="text-gray-600 mt-1">
              Configure salary calculation rules for different employee categories
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              resetForm();
              setEditingRule(null);
              setShowForm(!showForm);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Rule'}
          </button>
          <button
            onClick={initializeDefaults}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Initialize Default Rules
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="manager">Manager</option>
                <option value="executive">Executive</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingRule ? 'Edit Salary Rule' : 'Create New Salary Rule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRule}
                    value={formData.rule_name}
                    onChange={(e) =>
                      setFormData({ ...formData, rule_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., general-employees-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Category *
                  </label>
                  <select
                    required
                    value={formData.employee_category}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Brief description of this rule"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Multiplier * (1.0 - 3.0)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="1"
                    max="3"
                    value={formData.overtime_multiplier}
                    onChange={(e) =>
                      setFormData({ ...formData, overtime_multiplier: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Hours/Day * (1-24)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="24"
                    value={formData.standard_hours_per_day}
                    onChange={(e) =>
                      setFormData({ ...formData, standard_hours_per_day: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Days/Month * (1-31)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.working_days_per_month}
                    onChange={(e) =>
                      setFormData({ ...formData, working_days_per_month: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Working Hours/Month
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.min_working_hours_per_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_working_hours_per_month: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Working Hours/Month
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.max_working_hours_per_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_working_hours_per_month: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Deduction % (0-100)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.default_deduction_percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        default_deduction_percentage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.effective_from}
                    onChange={(e) =>
                      setFormData({ ...formData, effective_from: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Deduction Rules Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Absence Deduction Rules</h3>
                <div className="space-y-2 mb-4">
                  {formData.deduction_rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <span className="font-medium">{rule.absence_type}</span>:{' '}
                        {rule.deduction_percentage}% deduction
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDeductionRule(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAbsenceType}
                    onChange={(e) => setNewAbsenceType(e.target.value)}
                    placeholder="Absence type (e.g., medical)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDeductionPercentage}
                    onChange={(e) => setNewDeductionPercentage(e.target.value)}
                    placeholder="%"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addDeductionRule}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Rule
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading salary rules...</p>
          </div>
        )}

        {/* Rules List */}
        {!loading && rules.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              No salary rules found. Click "New Rule" or "Initialize Default Rules" to get started.
            </p>
          </div>
        )}

        {!loading && rules.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT Multiplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours/Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days/Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rule.rule_name}
                      </div>
                      {rule.description && (
                        <div className="text-sm text-gray-500">{rule.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rule.employee_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.overtime_multiplier}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.standard_hours_per_day}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.working_days_per_month}d
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rule.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : rule.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{rule.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.rule_name)}
                        className="text-red-600 hover:text-red-900"
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
  );
}
