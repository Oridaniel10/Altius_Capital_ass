// src/services/api.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// create main axios instance
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor - automatically add token to requests that need it
api.interceptors.request.use(
  (config) => {
    // for deals endpoints, we need to add token to request body
    if (config.url?.includes('/deals/')) {
      const token = localStorage.getItem('authToken');
      const website = localStorage.getItem('selectedWebsite');
      
      if (token && website && config.data) {
        config.data = {
          ...config.data,
          token,
          website
        };
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// response interceptor - handle session conflicts and authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // handle 409 session conflict - user logged in from another device
    if (error.response?.status === 409) {
      const errorData = error.response.data.detail;
      
      if (errorData?.error === 'SESSION_CONFLICT') {
        // clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('deals');
        localStorage.removeItem('selectedWebsite');
        
        // show alert to user
        alert('Your session has been terminated because you logged in from another device. Please log in again.');
        
        // redirect to login
        window.location.href = '/';
        
        return Promise.reject(error);
      }
    }
    
    // handle 401 unauthorized - but NOT from login attempts
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      const errorData = error.response.data.detail;
      
      if (errorData?.error === 'UNAUTHORIZED') {
        // clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('deals');
        localStorage.removeItem('selectedWebsite');
        
        // show alert to user
        alert('Your session has expired. Please log in again.');
        
        // redirect to login
        window.location.href = '/';
        
        return Promise.reject(error);
      }
    }
    
    // handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      alert('Network connection error. Please check your internet connection and try again.');
      return Promise.reject(error);
    }
    
    // handle all other API errors with a generic alert
    if (error.response && error.response.status >= 400) {
      let errorMessage = 'An error occurred while processing your request.';
      
      // try to get a more specific error message from the server
      if (error.response.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.detail.message) {
          errorMessage = error.response.data.detail.message;
        }
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // show alert with error message
      alert(`Error ${error.response.status}: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);
