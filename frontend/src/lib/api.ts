import { config } from './config';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  // Only set Content-Type if it's not a FormData request
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

// Helper function to make API calls with the configured base URL
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${config.API_URL}${endpoint}`;
  return fetchWithAuth(url, options);
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};
