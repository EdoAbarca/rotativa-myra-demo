// Shared constants for the application

// Default user ID for HR operations
// In production, this should be replaced with actual authentication
export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || 'hr_admin';

// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
