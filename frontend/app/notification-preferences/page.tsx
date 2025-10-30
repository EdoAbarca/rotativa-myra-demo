'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NotificationPreference {
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  email_address?: string;
  notification_types: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const AVAILABLE_NOTIFICATION_TYPES = [
  { value: 'absence', label: 'Absences' },
  { value: 'late', label: 'Late Arrivals' },
  { value: 'overtime', label: 'Overtime' },
];

export default function NotificationPreferencesPage() {
  const [userId] = useState('hr_admin'); // In production, this would come from authentication
  const [preferences, setPreferences] = useState<NotificationPreference | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/notifications/preferences/${userId}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `${API_URL}/notifications/preferences/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_enabled: preferences.email_enabled,
            in_app_enabled: preferences.in_app_enabled,
            email_address: preferences.email_address,
            notification_types: preferences.notification_types,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const data = await response.json();
      setPreferences(data);
      setSuccess('Preferences saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationType = (type: string) => {
    if (!preferences) return;

    const types = [...preferences.notification_types];
    const index = types.indexOf(type);

    if (index > -1) {
      types.splice(index, 1);
    } else {
      types.push(type);
    }

    setPreferences({ ...preferences, notification_types: types });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notification Preferences
              </h1>
              <p className="text-gray-600 mt-2">
                Configure how you want to receive absence alerts
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Preferences Form */}
        {preferences && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* User Info */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  User Information
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">User ID:</span> {userId}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={preferences.email_address || ''}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          email_address: e.target.value,
                        })
                      }
                      placeholder="your.email@company.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email address for notifications (optional)
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Channels
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive alerts via email
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          email_enabled: !preferences.email_enabled,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.email_enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.email_enabled
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        In-App Notifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive alerts in the application
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          in_app_enabled: !preferences.in_app_enabled,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.in_app_enabled
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.in_app_enabled
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Types
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select which types of events you want to be notified about
                </p>
                <div className="space-y-3">
                  {AVAILABLE_NOTIFICATION_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        id={type.value}
                        checked={preferences.notification_types.includes(
                          type.value,
                        )}
                        onChange={() => toggleNotificationType(type.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={type.value}
                        className="ml-3 text-sm font-medium text-gray-900 cursor-pointer flex-1"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => fetchPreferences()}
                    disabled={saving}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                  <button
                    onClick={savePreferences}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ About Notifications
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Notifications are sent when the system detects new unexcused
              absences
            </li>
            <li>
              • Email notifications require a valid email address to be
              configured
            </li>
            <li>
              • You can manage absence alerts on the{' '}
              <Link
                href="/absence-alerts"
                className="underline hover:text-blue-900"
              >
                Absence Alerts
              </Link>{' '}
              page
            </li>
            <li>• In-app notifications are displayed in the application</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
