// src/services/api.js
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include CSRF token in requests
api.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API service object with methods for API calls
const apiService = {
  // Activity Types
  getActivityTypes: () => api.get('/activity-types/'),
  createDefaults: () => api.get('/activity-types/create_defaults'),
  createActivityType: (data) => api.post('/activity-types/', data),
  updateActivityType: (id, data) => api.put(`/activity-types/${id}/`, data),
  deleteActivityType: (id) => api.delete(`/activity-types/${id}/`),
  
  // Activities
  getActivities: (activityTypeId = null) => {
    const params = activityTypeId ? { activity_type: activityTypeId } : {};
    return api.get('/activities/', { params });
  },
  createActivity: (data) => api.post('/activities/', data),
  updateActivity: (id, data) => api.put(`/activities/${id}/`, data),
  deleteActivity: (id) => api.delete(`/activities/${id}/`),
  
  // Time Logs
  getTimeLogs: (filters = {}) => api.get('/time-logs/', { params: filters }),
  createTimeLog: (data) => api.post('/time-logs/', data),
  updateTimeLog: (id, data) => api.put(`/time-logs/${id}/`, data),
  deleteTimeLog: (id) => api.delete(`/time-logs/${id}/`),
  getTimeLog: (id) => api.get(`/time-logs/${id}/`),
  
  // Dashboard Data
  getDashboardData: (days = 7) => 
    api.get('/time-logs/dashboard_data/', { params: { days }}),
};

export default apiService;