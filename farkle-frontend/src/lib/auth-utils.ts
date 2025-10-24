// Authentication utility functions

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 5);
};

export const getPasswordStrengthInfo = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return { text: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    case 2:
      return { text: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-400' };
    case 3:
      return { text: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    case 4:
      return { text: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' };
    case 5:
      return { text: 'Very Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
    default:
      return { text: '', color: 'bg-gray-500', textColor: 'text-gray-400' };
  }
};

export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// API interfaces - Updated to match backend exactly
interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    expiresAt: string;
    user: {
      id: number;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      displayName: string;
      createdAt: string;
      lastLoginAt?: string;
      isEmailVerified: boolean;
      gamesPlayed: number;
      gamesWon: number;
      highestScore: number;
      winRate: number;
      averageScore: number;
    };
  };
  errors?: string[];
}

// Real API calls for authentication
export const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; message?: string; token?: string; user?: any }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5186/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe
      }),
    });

    // Check if response is ok and has JSON content
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth API error:', response.status, errorText);
      return { 
        success: false, 
        message: `Server error (${response.status}): ${response.statusText}`
      };
    }

    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      return { 
        success: false, 
        message: 'Invalid response from server. Please check if the authentication service is running.'
      };
    }

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      // Store token in localStorage
      localStorage.setItem('farkle_token', result.data.token);
      localStorage.setItem('farkle_user', JSON.stringify(result.data.user));
      
      return { 
        success: true, 
        message: result.message,
        token: result.data.token,
        user: result.data.user
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Network error. Please check your connection.'
    };
  }
};

export const signUp = async (userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; message?: string; token?: string; user?: any }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5186/api'}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Check if response is ok and has JSON content
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth API error:', response.status, errorText);
      return { 
        success: false, 
        message: `Server error (${response.status}): ${response.statusText}`
      };
    }

    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      return { 
        success: false, 
        message: 'Invalid response from server. Please check if the authentication service is running.'
      };
    }

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      // Store token in localStorage
      localStorage.setItem('farkle_token', result.data.token);
      localStorage.setItem('farkle_user', JSON.stringify(result.data.user));
      
      return { 
        success: true, 
        message: result.message,
        token: result.data.token,
        user: result.data.user
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Network error. Please check your connection.'
    };
  }
};

export const updateGameStatistics = async (won: boolean, score: number): Promise<{ success: boolean; message?: string; user?: any }> => {
  try {
    const token = localStorage.getItem('farkle_token');
    if (!token) {
      return { 
        success: false, 
        message: 'Not authenticated'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5186/api'}/auth/update-game-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        won,
        score
      }),
    });

    // Check if response is ok and has JSON content
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update stats API error:', response.status, errorText);
      return { 
        success: false, 
        message: `Server error (${response.status}): ${response.statusText}`
      };
    }

    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      return { 
        success: false, 
        message: 'Invalid response from server.'
      };
    }

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      return { 
        success: true, 
        message: result.message,
        user: result.data
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Failed to update statistics'
      };
    }
  } catch (error) {
    console.error('Update game statistics error:', error);
    return { 
      success: false, 
      message: 'Network error. Please check your connection.'
    };
  }
};

// Legacy functions for backward compatibility
export const simulateSignIn = signIn;
export const simulateSignUp = signUp;

// Toast notification helpers
export const showSuccessToast = (message: string) => {
  // This would integrate with your toast system
  console.log('Success:', message);
};

export const showErrorToast = (message: string) => {
  // This would integrate with your toast system
  console.error('Error:', message);
};
